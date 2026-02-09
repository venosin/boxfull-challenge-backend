import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'securepassword' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
    @IsString()
    @IsOptional()
    profileImage?: string;
}
