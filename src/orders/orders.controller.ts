import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WebhookDto } from './dto/webhook.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Crear una nueva orden' })
    create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(req.user.userId, createOrderDto);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Listar órdenes del usuario' })
    findAll(@Req() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        return this.ordersService.findAll(req.user.userId, startDate, endDate);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    @ApiOperation({ summary: 'Obtener saldo de liquidación del usuario' })
    getBalance(@Req() req) {
        return this.ordersService.getSettlementSummary(req.user.userId);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Webhook para actualizaciones de órdenes' })
    @ApiResponse({ status: 200, description: 'Orden actualizada exitosamente' })
    handleWebhook(@Body() webhookDto: WebhookDto) {
        return this.ordersService.handleWebhook(webhookDto);
    }
}
