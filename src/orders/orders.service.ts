import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WebhookDto, WebhookStatus } from './dto/webhook.dto';

interface ShippingConfig {
    dayOfWeek: number;
    baseCost: number;
}

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateOrderDto) {
        // 1. Calcular Costo de Envío basado en el Día de la Semana
        // JS getDay(): 0 (Dom) - 6 (Sab)
        // DB dayOfWeek: 1 (Lun) - 7 (Dom)
        const currentDay = new Date().getDay();
        const dbDay = currentDay === 0 ? 7 : currentDay;

        let shippingConfig = await this.prisma.shippingConfig.findUnique({
            where: { dayOfWeek: dbDay },
        });

        // AUTO-CONFIGURACIÓN (Resiliencia)
        if (!shippingConfig) {
            // Si no existe configuración para hoy, la creamos automáticamente
            // Regla de Negocio: Fines de Semana $3.00, Días de Semana $2.00
            // 6 = Sábado, 7 = Domingo
            const baseCost = (dbDay === 6 || dbDay === 7) ? 3.00 : 2.00;

            try {
                shippingConfig = await this.prisma.shippingConfig.create({
                    data: {
                        dayOfWeek: dbDay,
                        baseCost: baseCost
                    }
                });
            } catch (error) {
                // Si falla la creación (ej: concurrencia), intentar buscar de nuevo o usar fallback en memoria
                console.error('Error creating default shipping config:', error);
                // Fallback en memoria si falla DB
                shippingConfig = { dayOfWeek: dbDay, baseCost } as any;
            }
        }

        const shippingCost = shippingConfig?.baseCost || 2.00;

        // 2. Crear Orden
        try {
            return await this.prisma.order.create({
                data: {
                    userId,
                    ...dto,
                    packages: dto.packages as any, // Cast para tipos de Prisma
                    shippingCost,
                    status: 'PENDING',
                },
            });
        } catch (error) {
            console.error('Error creating order:', error);
            throw new BadRequestException('Error al procesar la orden. Verifique los datos enviados.');
        }
    }

    async findAll(userId: string, startDate?: string, endDate?: string) {
        const where: any = { userId };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return this.prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getSettlementSummary(userId: string) {
        // Sumar settlementAmount para órdenes ENTREGADAS (DELIVERED)
        const result = await this.prisma.order.aggregate({
            _sum: {
                settlementAmount: true,
            },
            where: {
                userId,
                status: 'DELIVERED',
                isSettled: true, // Solo contar órdenes liquidadas por seguridad
            },
        });

        return {
            totalSettlement: result._sum.settlementAmount || 0,
        };
    }

    async handleWebhook(dto: WebhookDto) {
        const { orderId, status, collectedAmount } = dto;

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Orden no encontrada');
        }

        // Validación: Si la orden ya fue entregada, no permitir cambios
        if (order.status === 'DELIVERED') {
            // Si ya está entregada, retornar la orden actual sin cambios o lanzar excepción
            // El usuario pidió mensaje específico: "La orden ya ha sido entregada previamente"
            // Nota: En un webhook a veces se prefiere 200 OK para no reintentar, pero seguiremos la instrucción.
            throw new BadRequestException('La orden ya ha sido entregada previamente');
        }

        // Solo procesar liquidación si el estado es DELIVERED y no ha sido liquidada aún
        if (status === WebhookStatus.DELIVERED && !order.isSettled) {
            // Lógica:
            // Comisión = collectedAmount * 0.0001 (Máx 25.00)
            let commission = collectedAmount * 0.0001;
            if (commission > 25.00) commission = 25.00;

            let settlementAmount = 0;

            if (order.isCOD) {
                // Liquidación = collectedAmount - shippingCost - commission
                settlementAmount = collectedAmount - order.shippingCost - commission;
            } else {
                // Liquidación = -shippingCost
                // (Asumiendo que collectedAmount puede ser 0 o irrelevante para no-COD en este contexto)
                settlementAmount = -order.shippingCost;
            }

            return this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'DELIVERED',
                    collectedAmount,
                    commissionAmount: commission,
                    settlementAmount,
                    isSettled: true,
                },
            });
        } else {
            // Solo actualizar estado si no es DELIVERED o ya está liquidada
            return this.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: status as any, // Cast al enum OrderStatus
                    collectedAmount, // Actualizar monto recaudado por si acaso
                },
            });
        }
    }
}
