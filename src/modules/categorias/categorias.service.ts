import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  private idNumerico(id: string): number {
    const valor = Number(id);
    if (!Number.isSafeInteger(valor) || valor <= 0) throw new BadRequestException('El identificador de categoria no es valido.');
    return valor;
  }

  async create(dto: CreateCategoriaDto) {
    try {
      return await this.prisma.categorias.create({ data: { nombre: dto.nombre.trim() } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una categoria con ese nombre.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.categorias.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const categoria = await this.prisma.categorias.findUnique({
      where: { id: this.idNumerico(id) },
      include: { productos: true },
    });
    if (!categoria) throw new NotFoundException('La categoria no existe.');
    return categoria;
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    const categoriaId = this.idNumerico(id);
    await this.findOne(id);
    try {
      return await this.prisma.categorias.update({
        where: { id: categoriaId },
        data: { nombre: dto.nombre?.trim() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una categoria con ese nombre.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const categoriaId = this.idNumerico(id);
    await this.findOne(id);
    const cantidad = await this.prisma.productos.count({ where: { categoria_id: categoriaId } });
    if (cantidad > 0) throw new ConflictException('No se puede eliminar una categoria que contiene productos.');
    await this.prisma.categorias.delete({ where: { id: categoriaId } });
    return { mensaje: 'Categoria eliminada correctamente.' };
  }
}