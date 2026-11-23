import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';

@Injectable()
export class CuponesService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(dto: ValidateCuponDto) {
    const codigo = dto.code.trim().toUpperCase();
    if (!codigo) throw new BadRequestException('Debe indicar un codigo de cupon.');
    const cupon = await this.prisma.cupones.findUnique({ where: { codigo } });
    if (!cupon || !cupon.activo) throw new NotFoundException('El cupon no existe o no se encuentra activo.');
    const descuento = Number(cupon.descuento);
    if (!Number.isFinite(descuento) || descuento <= 0 || descuento > 100) {
      throw new BadRequestException('El descuento configurado para este cupon no es valido.');
    }
    return {
      valido: true,
      codigo: cupon.codigo,
      descuento,
      mensaje: 'Cupon valido.',
    };
  }

  async findAll() {
    return this.prisma.cupones.findMany({
      select: { id: true, codigo: true, descuento: true, activo: true },
      orderBy: { codigo: 'asc' },
    });
  }

  async create(data: { codigo: string; descuento: number; activo?: boolean }) {
    const codigo = data.codigo.trim().toUpperCase();
    if (!codigo || !Number.isFinite(data.descuento) || data.descuento <= 0 || data.descuento > 100) {
      throw new BadRequestException('El codigo y el descuento deben ser validos.');
    }
    try {
      return await this.prisma.cupones.create({
        data: { codigo, descuento: new Prisma.Decimal(data.descuento), activo: data.activo ?? true },
        select: { id: true, codigo: true, descuento: true, activo: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Ya existe un cupon con ese codigo.');
      }
      throw error;
    }
  }
}