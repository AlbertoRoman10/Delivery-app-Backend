import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuthDto) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { roles: { select: { id: true, nombre: true } } },
    });
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas.');
    const coincide = await compare(dto.password, usuario.password);
    if (!coincide) throw new UnauthorizedException('Credenciales incorrectas.');
    const secreto = process.env.JWT_SECRET;
    if (!secreto || secreto.length < 32) {
      throw new InternalServerErrorException('JWT_SECRET debe estar configurado con al menos 32 caracteres.');
    }
    const ahora = Math.floor(Date.now() / 1000);
    const cabecera = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const carga = Buffer.from(JSON.stringify({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.roles.nombre,
      iat: ahora,
      exp: ahora + 8 * 60 * 60,
    })).toString('base64url');
    const contenido = `${cabecera}.${carga}`;
    const firma = createHmac('sha256', secreto).update(contenido).digest('base64url');
    return {
      autenticado: true,
      accessToken: `${contenido}.${firma}`,
      tokenType: 'Bearer',
      expiresIn: 28800,
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.roles },
    };
  }
}