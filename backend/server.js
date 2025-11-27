
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Joi = require('joi');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.json());

async function runTx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createTransaction(client, id, user_id, type, amount, meta) {
  await client.query(
    `INSERT INTO transactions(id, user_id, type, amount, meta) VALUES($1,$2,$3,$4,$5)`,
    [id, user_id, type, amount, JSON.stringify(meta || {})]
  );
}

app.post('/api/auth/register', async (req, res) => {
  const schema = Joi.object({ username: Joi.string().alphanum().min(3).max(30).required(), password: Joi.string().min(6).required(), role: Joi.string().default('user'), ref: Joi.string().optional() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  const { username, password, role, ref } = value;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    let parent_id = null;
    if (ref) {
      const row = await pool.query('SELECT id FROM users WHERE agent_code = $1', [ref]);
      if (row.rowCount) parent_id = row.rows[0].id;
    }
    await pool.query('INSERT INTO users(id, username, password_hash, role, parent_id, agent_code) VALUES($1,$2,$3,$4,$5,$6)', [id, username, hashed, role, parent_id, (role!== 'user') ? (username + '_' + Math.random().toString(36).slice(2,7)).toUpperCase() : null]);
    res.json({ success:true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const row = await pool.query('SELECT id, password_hash, role FROM users WHERE username = $1', [username]);
    if (!row.rowCount) return res.status(401).json({ error: 'invalid' });
    const user = row.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid' });
    res.json({ success:true, id: user.id, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-provider-sign'] || req.headers['x-signature'];
  if (!verifyProviderSignature(payload, signature)) {
    return res.status(403).send('invalid signature');
  }

  const { external_tx_id, user_id, amount, status } = payload;
  if (status !== 'SUCCESS') return res.status(200).send('ignored');

  try {
    await runTx(async (client) => {
      const exists = await client.query("SELECT id FROM transactions WHERE meta->>'external_tx_id' = $1", [external_tx_id]);
      if (exists.rowCount) return;
      await client.query('UPDATE users SET ewallet_balance = ewallet_balance + $1 WHERE id = $2', [amount, user_id]);
      await createTransaction(client, uuidv4(), user_id, 'deposit', amount, { external_tx_id });
      await distributeCommissionTx(client, user_id, amount, 'deposit');
    });
    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

app.post('/api/sports/settlement', async (req, res) => {
  const body = req.body;
  try {
    await runTx(async (client) => {
      for (const market of body.markets || []) {
        const { market_id, winning_selection } = market;
        const winningBets = await client.query('SELECT id, user_id, stake, price FROM bets WHERE market_id=$1 AND selection=$2 AND status=$3 FOR UPDATE', [market_id, winning_selection, 'pending']);
        for (const b of winningBets.rows) {
          const payout = Number(b.stake) * Number(b.price);
          await client.query('UPDATE bets SET status=$1, settled_at=now() WHERE id=$2', ['won', b.id]);
          await client.query('UPDATE users SET ewallet_balance = ewallet_balance + $1 WHERE id = $2', [payout, b.user_id]);
          await createTransaction(client, uuidv4(), b.user_id, 'payout', payout, { betId: b.id, market_id });
        }
        await client.query("UPDATE bets SET status='lost' WHERE market_id=$1 AND status='pending'", [market_id]);
      }
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false });
  }
});

app.post('/api/casino/launch', async (req, res) => {
  const { user_id, game_code } = req.body;
  try {
    const resp = await axios.post('https://provider.example.com/api/session', { user: user_id, game: game_code }, { headers: { 'Authorization': 'Bearer ' + process.env.CASINO_PROVIDER_KEY } });
    return res.json({ launchUrl: resp.data.launchUrl, token: resp.data.token });
  } catch (err) {
    console.error('casino launch err', err?.response?.data || err.message);
    res.status(500).json({ error: 'provider error' });
  }
});

app.post('/api/bet/place', async (req, res) => {
  const { user_id, market_id, selection, stake, price } = req.body;
  try {
    await runTx(async (client) => {
      const urow = await client.query('SELECT ewallet_balance FROM users WHERE id=$1 FOR UPDATE', [user_id]);
      if (!urow.rowCount) throw new Error('user not found');
      if (Number(urow.rows[0].ewallet_balance) < Number(stake)) throw new Error('insufficient balance');
      await client.query('UPDATE users SET ewallet_balance = ewallet_balance - $1 WHERE id = $2', [stake, user_id]);
      const betId = uuidv4();
      await client.query('INSERT INTO bets(id, user_id, market_id, selection, stake, price, status, placed_at) VALUES($1,$2,$3,$4,$5,$6,$7,now())', [betId, user_id, market_id, selection, stake, price, 'pending']);
      await createTransaction(client, uuidv4(), user_id, 'bet', -stake, { betId, market_id });
      await client.query('UPDATE users SET turnover = turnover + $1 WHERE id = $2', [stake, user_id]);
      res.json({ success:true, betId });
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

async function distributeCommissionTx(client, user_id, amount, type='deposit') {
  async function getUser(id) {
    const r = await client.query('SELECT id, parent_id, role FROM users WHERE id=$1', [id]);
    return r.rowCount ? r.rows[0] : null;
  }
  let node = await getUser(user_id);
  let applied = [];
  let anc = node;
  while (anc && anc.parent_id) {
    anc = await getUser(anc.parent_id);
    if (!anc) break;
    if (anc.role === 'b2c_subadmin') break;
  }
  let basePercent = 0;
  if (anc && anc.role === 'b2c_subadmin') {
    const cfg = await client.query('SELECT percent FROM commissions_config WHERE owner_subadmin_id=$1 AND type=$2', [anc.id, type]);
    basePercent = cfg.rowCount ? cfg.rows[0].percent : 0;
  }
  if (!basePercent) {
    const g = await client.query('SELECT percent FROM commissions_config WHERE owner_subadmin_id IS NULL AND type=$1', [type]);
    basePercent = g.rowCount ? g.rows[0].percent : 0;
  }
  let percentForLevel = basePercent;
  let current = await getUser(user_id);
  let level = 0;
  while (current && current.parent_id && percentForLevel > 0 && level < 8) {
    const parent = await getUser(current.parent_id);
    if (!parent) break;
    const commissionAmount = (amount * percentForLevel) / 100.0;
    if (commissionAmount > 0) {
      await client.query('UPDATE users SET ewallet_balance = ewallet_balance + $1 WHERE id = $2', [commissionAmount, parent.id]);
      await createTransaction(client, uuidv4(), parent.id, 'commission', commissionAmount, { from: user_id, type, level });
      await client.query('INSERT INTO commission_logs(to_user_id, from_user_id, type, percent, amount, meta) VALUES($1,$2,$3,$4,$5,$6)', [parent.id, user_id, type, percentForLevel, commissionAmount, JSON.stringify({ level })]);
      applied.push({ to: parent.id, amount: commissionAmount, percent: percentForLevel, level });
    }
    percentForLevel = Number((percentForLevel * 0.5).toFixed(6));
    current = parent;
    level++;
  }
  return applied;
}

function verifyProviderSignature(payload, signature) {
  return true; // implement HMAC verification using secret in production
}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log('Integration server running on port', PORT));
