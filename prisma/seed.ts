import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding ShippingConfig...');

    const configs = [
        { dayOfWeek: 1, baseCost: 3.00 }, // Lunes
        { dayOfWeek: 2, baseCost: 3.50 }, // Martes
        { dayOfWeek: 3, baseCost: 4.00 }, // Miércoles
        { dayOfWeek: 4, baseCost: 3.50 }, // Jueves
        { dayOfWeek: 5, baseCost: 4.50 }, // Viernes
        { dayOfWeek: 6, baseCost: 5.00 }, // Sábado
        { dayOfWeek: 7, baseCost: 2.50 }, // Domingo
    ];

    for (const config of configs) {
        const upserted = await prisma.shippingConfig.upsert({
            where: { dayOfWeek: config.dayOfWeek },
            update: { baseCost: config.baseCost },
            create: {
                dayOfWeek: config.dayOfWeek,
                baseCost: config.baseCost,
            },
        });
        console.log(`Upserted config for day ${config.dayOfWeek}: $${config.baseCost}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
