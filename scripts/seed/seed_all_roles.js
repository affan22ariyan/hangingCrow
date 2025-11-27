const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const roleHierarchy = [
    { username: 'owner', password: 'password123', role: 'OWNER' },
    { username: 'mother', password: 'password123', role: 'MOTHER' },
    { username: 'whitelabel', password: 'password123', role: 'WHITELABEL' },
    { username: 'superadmin', password: 'password123', role: 'SUPERADMIN' },
    { username: 'admin', password: 'password123', role: 'ADMIN' },
    { username: 'b2c_subadmin', password: 'password123', role: 'B2C_SUBADMIN' },
    { username: 'b2b_subadmin', password: 'password123', role: 'B2B_SUBADMIN' },
    { username: 'senior_affiliate', password: 'password123', role: 'SENIOR_AFFILIATE' },
    { username: 'affiliate', password: 'password123', role: 'AFFILIATE' },
    { username: 'super_agent', password: 'password123', role: 'SUPER_AGENT' },
    { username: 'master_agent', password: 'password123', role: 'MASTER_AGENT' },
    { username: 'agent', password: 'password123', role: 'AGENT' },
    { username: 'testuser', password: 'password123', role: 'USER' },
];

async function main() {
    console.log('🌱 Seeding database with 13-role system...\n');

    // Create or find default tenant
    const tenant = await prisma.tenant.upsert({
        where: { domain: 'default.local' },
        update: {},
        create: {
            name: 'Default Tenant',
            domain: 'default.local',
        },
    });
    console.log('✓ Created/found tenant:', tenant.id);

    // Create users with hierarchy
    let previousUser = null;

    for (const userData of roleHierarchy) {
        const hash = await bcrypt.hash(userData.password, 10);

        const user = await prisma.user.upsert({
            where: { username: userData.username },
            update: {},
            create: {
                username: userData.username,
                password: hash,
                role: userData.role,
                tenantId: tenant.id,
                parentId: previousUser?.id || null, // Create hierarchy chain
                wallet: {
                    create: {
                        currency: 'BDT',
                        balance: userData.role === 'USER' ? 10000 : 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });

        console.log(`✓ Created/found ${userData.role.padEnd(20)} user: ${userData.username}`);
        previousUser = user;
    }

    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Test Credentials (username / password):');
    console.log('──────────────────────────────────────────');
    roleHierarchy.forEach(({ username, password, role }) => {
        console.log(`   ${username.padEnd(20)} / ${password.padEnd(15)} [${role}]`);
    });
    console.log('\n💡 All accounts are in a hierarchy chain (owner → mother → ... → user)');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
