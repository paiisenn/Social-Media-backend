import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Kiểm tra email đã tồn tại
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);


        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
            },
        });

        // Tạo JWT token
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        return {
            access_token: token,
            user,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                password: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Tạo JWT token
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
            access_token: token,
            user: userWithoutPassword,
        };
    }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}