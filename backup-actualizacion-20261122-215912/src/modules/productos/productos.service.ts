import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductoDto) {
    throw new Error('Pendiente de implementar');
  }

  async findAll() {
    return await this.prisma.productos.findMany();
  }

  findOne(id: string) {
    throw new Error('Pendiente de implementar');
  }

  update(id: string, dto: UpdateProductoDto) {
    throw new Error('Pendiente de implementar');
  }

  remove(id: string) {
    throw new Error('Pendiente de implementar');
  }
}