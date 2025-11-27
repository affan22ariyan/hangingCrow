import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Container, Grid, Card, CardContent, AppBar, Toolbar, Chip } from '@mui/material';
import { SportsSoccer, AccountBalance } from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from './store/authStore';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken, setUser, setBalance } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }
        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        setLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || `Login failed: ${response.status}`);
            }

            if (!data.access_token) {
                throw new Error('No authentication token received');
            }

            setToken(data.access_token);
            setUser({ username: username.trim(), ...data.user });

            // Fetch user balance
            try {
                const balanceResponse = await fetch(`${API_BASE}/api/user/balance`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    setBalance(balanceData.balance || 10000);
                } else {
                    setBalance(10000); // Default balance
                }
            } catch (balanceError) {
                console.warn('Failed to fetch balance, using default:', balanceError);
                setBalance(10000); // Default balance
            }

            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Login error:', err);
            let errorMessage = 'Invalid credentials';
            
            if (err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper sx={{ p: 4, width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Box textAlign="center" mb={3}>
                        <SportsSoccer sx={{ fontSize: 60, color: '#00e676' }} />
                        <Typography variant="h4" gutterBottom color="white" fontWeight="bold">
                            Betting Platform
                        </Typography>
                        <Typography variant="subtitle1" color="white">
                            Place your bets and win big!
                        </Typography>
                    </Box>
                    {error && (
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.dark' }}>
                            <Typography color="white" sx={{ wordWrap: 'break-word' }}>
                                {error}
                            </Typography>
                        </Paper>
                    )}
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                            sx={{ bgcolor: 'white', borderRadius: 1 }}
                            autoComplete="username"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                            sx={{ bgcolor: 'white', borderRadius: 1 }}
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 3, 
                                py: 1.5, 
                                bgcolor: '#00e676', 
                                '&:hover': { bgcolor: '#00c853' },
                                '&:disabled': { bgcolor: '#ccc' }
                            }}
                            size="large"
                        >
                            {loading ? 'Logging in...' : 'Login to Bet'}
                        </Button>
                    </form>
                    <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'white', textAlign: 'center' }}>
                        Test: testuser / password123
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

function BettingDashboard() {
    const { token, user, balance, logout } = useAuthStore();
    const [odds, setOdds] = useState(2.5);
    const [stake, setStake] = useState(100);
    const [bets, setBets] = useState<any[]>([]);

    if (!token) return <Navigate to="/login" />;

    const handlePlaceBet = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_BASE}/api/betting/place`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    marketId: 'market_' + Date.now(),
                    selectionId: 'sel_' + Math.random(),
                    odds,
                    stake,
                }),
            });

            if (response.ok) {
                const bet = await response.json();
                setBets([bet, ...bets]);
                alert('Bet placed successfully!');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to place bet');
            }
        } catch (err) {
            console.error('Bet error:', err);
            alert('Error placing bet');
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <SportsSoccer sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Betting Platform
                    </Typography>
                    <Chip
                        icon={<AccountBalance />}
                        label={`Balance: ${balance.toLocaleString()} BDT`}
                        color="success"
                        sx={{ mr: 2 }}
                    />
                    <Typography sx={{ mr: 2 }}>{user?.username}</Typography>
                    <Button color="inherit" onClick={logout}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Place Bet Section */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Place Your Bet
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Odds"
                                    type="number"
                                    value={odds}
                                    onChange={(e) => setOdds(parseFloat(e.target.value))}
                                    margin="normal"
                                    inputProps={{ step: 0.1, min: 1.01 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Stake (BDT)"
                                    type="number"
                                    value={stake}
                                    onChange={(e) => setStake(parseInt(e.target.value))}
                                    margin="normal"
                                    inputProps={{ min: 10 }}
                                />
                                <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                                    Potential Win: <strong>{(odds * stake).toFixed(2)} BDT</strong>
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    onClick={handlePlaceBet}
                                >
                                    Place Bet
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* My Bets Section */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    My Bets
                                </Typography>
                                {bets.length === 0 ? (
                                    <Typography color="text.secondary">
                                        No bets placed yet. Place your first bet!
                                    </Typography>
                                ) : (
                                    bets.map((bet, idx) => (
                                        <Paper key={idx} sx={{ p: 2, mb: 1 }}>
                                            <Typography variant="body2">
                                                Odds: {bet.odds} | Stake: {bet.stake} BDT
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Status: {bet.status}
                                            </Typography>
                                        </Paper>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Live Markets */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Live Markets
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Typography variant="h6">Football Match</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Team A vs Team B
                                            </Typography>
                                            <Chip label="2.5 odds" color="primary" sx={{ mt: 1 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Typography variant="h6">Cricket Match</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                India vs Pakistan
                                            </Typography>
                                            <Chip label="1.8 odds" color="primary" sx={{ mt: 1 }} />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Typography variant="h6">Tennis Match</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Player X vs Player Y
                                            </Typography>
                                            <Chip label="3.2 odds" color="primary" sx={{ mt: 1 }} />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<BettingDashboard />} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
