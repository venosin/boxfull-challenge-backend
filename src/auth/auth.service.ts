import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Verificar si el usuario existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        // Crear usuario
        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
        });

        return this.signToken(user.id, user.email, user.role, user.firstName, user.lastName);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signToken(user.id, user.email, user.role, user.firstName, user.lastName);
    }

    private async signToken(userId: string, email: string, role: string, firstName: string, lastName: string) {
        const payload = { sub: userId, email, role };
        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            user: {
                firstName,
                lastName,
                email,
                role
            }
        };
    }
}
