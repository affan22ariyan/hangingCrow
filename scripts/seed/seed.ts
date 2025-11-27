import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create tenant
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Default Tenant',
            domain: 'default.local',
        },
    });
    console.log('✓ Created tenant:', tenant.id);

    // Create owner user
    const hash = await bcrypt.hash('password123', 10);
    const owner = await prisma.user.create({
        data: {
            username: 'admin',
            password: hash,
            role: 'OWNER',
            tenantId: tenant.id,
            wallet: {
                create: {
                    currency: 'BDT',
                },
            },
        },
    });
    console.log('✓ Created owner user:', owner.username);

    // Create test user
    const user = await prisma.user.create({
        data: {
            username: 'testuser',
            password: hash,
            role: 'USER',
            tenantId: tenant.id,
            parentId: owner.id,
            wallet: {
                create: {
                    currency: 'BDT',
                    balance: 10000, // 10000 BDT for testing
                },
            },
        },
    });
    console.log('✓ Created test user:', user.username);

    console.log('\n✅ Seeding complete!');
    console.log('\nTest Credentials:');
    console.log('- Admin: admin / password123');
    console.log('- User: testuser / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
