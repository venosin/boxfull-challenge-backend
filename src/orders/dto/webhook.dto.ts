import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookStatus {
    DELIVERED = 'DELIVERED',
    IN_TRANSIT = 'IN_TRANSIT',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
}

export class WebhookDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @ApiProperty({ enum: WebhookStatus })
    @IsEnum(WebhookStatus)
    status: WebhookStatus;

    @ApiProperty()
    @IsNumber()
    collectedAmount: number;
}
