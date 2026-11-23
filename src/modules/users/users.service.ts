
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Comprobamos que el ID sea válido.
  private validarId(id: number): number {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('El identificador de usuario no es válido.');
    }
    return id;
  }

  // Datos seguros que podemos devolver sin mostrar la contraseña.
  private readonly seleccionSegura = {
    id: true,
    email: true,
    rol_id: true,
    roles: {
      select: {
        id: true,
        nombre: true,
      },
    },
  } as const;

  // Crear un usuario.
  async create(dto: CreateUserDto) {
    const rol = await this.prisma.roles.findUnique({
      where: { id: dto.rolId },
    });

    if (!rol) {
      throw new NotFoundException('El rol indicado no existe.');
    }

    try {
      const password = await hash(dto.password, 12);

      return await this.prisma.usuarios.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          password,
          rol_id: dto.rolId,
        },
        select: this.seleccionSegura,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un usuario con ese email.');
      }
      throw error;
    }
  }

  // Obtener todos los usuarios.
  async findAll() {
    return this.prisma.usuarios.findMany({
      select: {
        ...this.seleccionSegura,
        clientes: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            direccion: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  // Obtener un usuario por su ID.
  async findOne(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: this.validarId(id) },
      select: {
        ...this.seleccionSegura,
        clientes: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }

    return usuario;
  }

  // Modificar los datos de un usuario.
  async update(id: number, dto: UpdateUserDto) {
    const usuarioId = this.validarId(id);

    await this.findOne(usuarioId);

    const data: Prisma.usuariosUpdateInput = {};

    if (dto.email !== undefined) {
      data.email = dto.email.toLowerCase().trim();
    }

    if (dto.password !== undefined) {
      data.password = await hash(dto.password, 12);
    }

    if (dto.rolId !== undefined) {
      const rol = await this.prisma.roles.findUnique({
        where: { id: dto.rolId },
      });

      if (!rol) {
        throw new NotFoundException('El rol indicado no existe.');
      }

      data.roles = {
        connect: { id: dto.rolId },
      };
    }

    try {
      return await this.prisma.usuarios.update({
        where: { id: usuarioId },
        data,
        select: this.seleccionSegura,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe otro usuario con ese email.');
      }
      throw error;
    }
  }

  // Eliminar un usuario.
  async remove(id: number) {
    const usuarioId = this.validarId(id);

    await this.findOne(usuarioId);

    const cliente = await this.prisma.clientes.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (cliente) {
      throw new ConflictException(
        'No se puede eliminar un usuario asociado a un cliente.',
      );
    }

    await this.prisma.usuarios.delete({
      where: { id: usuarioId },
    });

    return {
      mensaje: 'Usuario eliminado correctamente.',
    };
  }
}
