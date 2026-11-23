import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  private idNumerico(id: string): number {
    const valor = Number(id);
    if (!Number.isSafeInteger(valor) || valor <= 0) throw new BadRequestException('El identificador de cliente no es valido.');
    return valor;
  }

  async create(dto: CreateClienteDto) {
    if (!dto.email) throw new BadRequestException('El email es obligatorio para asociar el cliente a un usuario existente.');
    const usuario = await this.prisma.usuarios.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (!usuario) throw new NotFoundException('No existe un usuario registrado con ese email. Primero debe registrarse el usuario.');
    const asociado = await this.prisma.clientes.findUnique({ where: { usuario_id: usuario.id } });
    if (asociado) throw new ConflictException('Ese usuario ya tiene un perfil de cliente.');
    return this.prisma.clientes.create({
      data: {
        usuario_id: usuario.id,
        nombre: dto.nombre.trim(),
        telefono: dto.telefono.trim(),
        direccion: dto.direccion?.trim() ?? '',
      },
      include: { usuarios: { select: { id: true, email: true, rol_id: true } } },
    });
  }

  async findAll() {
    return this.prisma.clientes.findMany({
      include: { usuarios: { select: { id: true, email: true, rol_id: true } }, _count: { select: { pedidos: true } } },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id: this.idNumerico(id) },
      include: { usuarios: { select: { id: true, email: true, rol_id: true } }, pedidos: true },
    });
    if (!cliente) throw new NotFoundException('El cliente no existe.');
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    const clienteId = this.idNumerico(id);
    await this.findOne(id);
    const data: Prisma.clientesUpdateInput = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.telefono !== undefined) data.telefono = dto.telefono.trim();
    if (dto.direccion !== undefined) data.direccion = dto.direccion.trim();
    if (dto.email !== undefined) {
      const usuario = await this.prisma.usuarios.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
      if (!usuario) throw new NotFoundException('No existe un usuario con el email indicado.');
      data.usuarios = { connect: { id: usuario.id } };
    }
    try {
      return await this.prisma.clientes.update({
        where: { id: clienteId }, data,
        include: { usuarios: { select: { id: true, email: true, rol_id: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El usuario indicado ya tiene otro perfil de cliente.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const clienteId = this.idNumerico(id);
    await this.findOne(id);
    const pedidos = await this.prisma.pedidos.count({ where: { cliente_id: clienteId } });
    if (pedidos > 0) throw new ConflictException('No se puede eliminar un cliente que tiene pedidos registrados.');
    await this.prisma.clientes.delete({ where: { id: clienteId } });
    return { mensaje: 'Cliente eliminado correctamente.' };
  }
}