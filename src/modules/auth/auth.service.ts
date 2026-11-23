
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { compare, hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterAuthDto) {
    const email = dto.email.toLowerCase().trim();

    // Comprobamos si el correo ya está registrado.
    const usuarioExistente = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El correo ya está registrado.');
    }

    // Buscamos el rol CLIENTE.
    const rolCliente = await this.prisma.roles.findUnique({
      where: { nombre: 'CLIENTE' },
    });

    if (!rolCliente) {
      throw new NotFoundException('No existe el rol CLIENTE.');
    }

    // Encriptamos la contraseña.
    const passwordHash = await hash(dto.password, 10);

    // Creamos el usuario y su perfil de cliente juntos.
    const resultado = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.create({
        data: {
          email,
          password: passwordHash,
          rol_id: rolCliente.id,
        },
      });

      const cliente = await tx.clientes.create({
        data: {
          usuario_id: usuario.id,
          nombre: dto.nombre,
          telefono: dto.telefono,
          direccion: dto.direccion,
        },
      });

      return {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        cliente,
      };
    });

    return resultado;
  }

  async login(dto: LoginAuthDto) {
    // Buscamos el usuario y su rol.
    const usuario = await this.prisma.usuarios.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        roles: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    // Comparamos la contraseña ingresada con la guardada.
    const passwordValida = await compare(dto.password, usuario.password);

    if (!passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    // Comprobamos que exista el secreto para firmar el token.
    const secreto = process.env.JWT_SECRET;

    if (!secreto || secreto.length < 32) {
      throw new InternalServerErrorException(
        'JWT_SECRET debe estar configurado con al menos 32 caracteres.',
      );
    }

    // Generamos el token JWT.
    const ahora = Math.floor(Date.now() / 1000);

    const cabecera = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');

    const carga = Buffer.from(
      JSON.stringify({
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.roles.nombre,
        iat: ahora,
        exp: ahora + 8 * 60 * 60,
      }),
    ).toString('base64url');

    const contenido = `${cabecera}.${carga}`;

    const firma = createHmac('sha256', secreto)
      .update(contenido)
      .digest('base64url');

    return {
      autenticado: true,
      accessToken: `${contenido}.${firma}`,
      tokenType: 'Bearer',
      expiresIn: 28800,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.roles,
      },
    };
  }
}
