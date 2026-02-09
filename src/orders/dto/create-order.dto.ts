import { IsString, IsNotEmpty, IsEmail, IsArray, ValidateNested, IsBoolean, IsNumber, IsOptional, ValidateIf, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PackageDto {
    @ApiProperty()
    @IsNumber()
    length: number;

    @ApiProperty()
    @IsNumber()
    height: number;

    @ApiProperty()
    @IsNumber()
    width: number;

    @ApiProperty()
    @IsNumber()
    weight: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    content?: string;
}

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    pickupAddress: string;

    @ApiProperty()
    @IsDateString()
    scheduledDate: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientLastName: string;

    @ApiProperty()
    @IsEmail()
    recipientEmail: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientPhone: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientAddress: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientDepartment: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    recipientMunicipality: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    referencePoint?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    instructions?: string;

    @ApiProperty({ type: [PackageDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PackageDto)
    packages: PackageDto[];

    @ApiProperty()
    @IsBoolean()
    isCOD: boolean;

    @ApiProperty({ required: false })
    @ValidateIf(o => o.isCOD)
    @IsNumber()
    @IsNotEmpty()
    expectedCodAmount?: number;
}
