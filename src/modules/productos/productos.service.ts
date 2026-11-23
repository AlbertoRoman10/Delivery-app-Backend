import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  private convertirId(id: string): number {
    const valor = Number(id);
    if (!Number.isSafeInteger(valor) || valor <= 0) {
      throw new BadRequestException('El identificador del producto no es valido.');
    }
    return valor;
  }

  async create(dto: CreateProductoDto) {
    const categoriaId = Number(dto.categoriaId);
    if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
      throw new BadRequestException('La categoria indicada no es valida.');
    }
    const categoria = await this.prisma.categorias.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new NotFoundException('La categoria indicada no existe.');
    try {
      return await this.prisma.productos.create({
        data: { nombre: dto.nombre.trim(), precio: new Prisma.Decimal(dto.precio), stock: dto.stock, categoria_id: categoriaId },
        include: { categorias: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un producto con esos datos unicos.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.productos.findMany({
      include: { categorias: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const producto = await this.prisma.productos.findUnique({
      where: { id: this.convertirId(id) },
      include: { categorias: true },
    });
    if (!producto) throw new NotFoundException('El producto no existe.');
    return producto;
  }

  async update(id: string, dto: UpdateProductoDto) {
    const productoId = this.convertirId(id);
    await this.findOne(id);
    const data: Prisma.productosUpdateInput = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.precio !== undefined) data.precio = new Prisma.Decimal(dto.precio);
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.categoriaId !== undefined) {
      const categoriaId = Number(dto.categoriaId);
      if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) throw new BadRequestException('La categoria indicada no es valida.');
      const categoria = await this.prisma.categorias.findUnique({ where: { id: categoriaId } });
      if (!categoria) throw new NotFoundException('La categoria indicada no existe.');
      data.categorias = { connect: { id: categoriaId } };
    }
    return this.prisma.productos.update({ where: { id: productoId }, data, include: { categorias: true } });
  }

  async remove(id: string) {
    const productoId = this.convertirId(id);
    await this.findOne(id);
    const referencias = await this.prisma.pedido_productos.count({ where: { producto_id: productoId } });
    if (referencias > 0) throw new ConflictException('No se puede eliminar un producto que forma parte de pedidos registrados.');
    await this.prisma.productos.delete({ where: { id: productoId } });
    return { mensaje: 'Producto eliminado correctamente.' };
  }
}