import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';

const estadosPermitidos = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  private idNumerico(id: string): number {
    const valor = Number(id);
    if (!Number.isSafeInteger(valor) || valor <= 0) throw new BadRequestException('El identificador del pedido no es valido.');
    return valor;
  }

  async create(dto: CreatePedidoDto) {
    const telefono = dto.telefono.trim();
    const cliente = await this.prisma.clientes.findFirst({
      where: { telefono },
      include: { usuarios: { select: { id: true, email: true } } },
    });
    if (!cliente) {
      throw new NotFoundException('No existe un cliente registrado con ese telefono. Registre primero el usuario y el cliente.');
    }

    const ids = dto.items.map((item) => Number(item.productoId));
    if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new BadRequestException('Uno o mas productos tienen identificadores invalidos.');
    if (new Set(ids).size !== ids.length) throw new BadRequestException('No repita productos; envie una sola linea por producto con su cantidad total.');

    const codigoCupon = dto.codigoCupon?.trim().toUpperCase();
    return this.prisma.$transaction(async (tx) => {
      const productos = await tx.productos.findMany({ where: { id: { in: ids } } });
      if (productos.length !== ids.length) throw new NotFoundException('Uno o mas productos no existen.');
      const mapa = new Map(productos.map((producto) => [producto.id, producto]));
      let subtotal = new Prisma.Decimal(0);
      const detalles: { producto_id: number; cantidad: number; precio_unitario: Prisma.Decimal }[] = [];

      for (const item of dto.items) {
        const productoId = Number(item.productoId);
        const producto = mapa.get(productoId);
        if (!producto) throw new NotFoundException('No se encontro uno de los productos solicitados.');
        if (producto.stock < item.cantidad) throw new ConflictException(`Stock insuficiente para ${producto.nombre}.`);
        const precio = new Prisma.Decimal(producto.precio);
        subtotal = subtotal.plus(precio.mul(item.cantidad));
        detalles.push({ producto_id: productoId, cantidad: item.cantidad, precio_unitario: precio });
      }

      let cuponId: number | null = null;
      let descuentoPorcentaje = 0;
      if (codigoCupon) {
        const cupon = await tx.cupones.findUnique({ where: { codigo: codigoCupon } });
        if (!cupon || !cupon.activo) throw new BadRequestException('El cupon indicado no existe o esta inactivo.');
        descuentoPorcentaje = Number(cupon.descuento);
        if (descuentoPorcentaje <= 0 || descuentoPorcentaje > 100) throw new BadRequestException('El descuento del cupon no es valido.');
        cuponId = cupon.id;
      }

      for (const item of dto.items) {
        const resultado = await tx.productos.updateMany({
          where: { id: Number(item.productoId), stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (resultado.count !== 1) throw new ConflictException('El stock cambio mientras se procesaba el pedido. Intente nuevamente.');
      }

      const pedido = await tx.pedidos.create({
        data: {
          cliente_id: cliente.id,
          cupon_id: cuponId,
          estado: 'PENDIENTE',
          pedido_productos: { create: detalles },
        },
        include: {
          clientes: true,
          cupones: { select: { codigo: true, descuento: true } },
          pedido_productos: { include: { productos: true } },
        },
      });

      const descuento = subtotal.mul(descuentoPorcentaje).div(100);
      const total = subtotal.minus(descuento);
      return {
        ...pedido,
        resumen: {
          subtotal: Number(subtotal.toFixed(2)),
          descuentoPorcentaje,
          descuento: Number(descuento.toFixed(2)),
          total: Number(total.toFixed(2)),
        },
      };
    });
  }

  async findAll() {
    return this.prisma.pedidos.findMany({
      include: {
        clientes: true,
        cupones: { select: { codigo: true, descuento: true } },
        pedido_productos: { include: { productos: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedidos.findUnique({
      where: { id: this.idNumerico(id) },
      include: {
        clientes: true,
        cupones: { select: { codigo: true, descuento: true } },
        pedido_productos: { include: { productos: true } },
      },
    });
    if (!pedido) throw new NotFoundException('El pedido no existe.');
    return pedido;
  }

  async updateEstado(id: string, dto: UpdateEstadoPedidoDto) {
    const pedidoId = this.idNumerico(id);
    const nuevoEstado = dto.estado.toUpperCase();
    if (!estadosPermitidos.includes(nuevoEstado)) throw new BadRequestException('El estado indicado no es valido.');

    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedidos.findUnique({
        where: { id: pedidoId },
        include: { pedido_productos: true },
      });
      if (!pedido) throw new NotFoundException('El pedido no existe.');
      if (pedido.estado === 'CANCELADO') throw new ConflictException('Un pedido cancelado no puede modificarse.');
      if (pedido.estado === 'ENTREGADO') throw new ConflictException('Un pedido entregado no puede modificarse.');

      if (nuevoEstado === 'CANCELADO') {
        for (const detalle of pedido.pedido_productos) {
          await tx.productos.update({
            where: { id: detalle.producto_id },
            data: { stock: { increment: detalle.cantidad } },
          });
        }
      }

      return tx.pedidos.update({
        where: { id: pedidoId },
        data: { estado: nuevoEstado },
        include: {
          clientes: true,
          pedido_productos: { include: { productos: true } },
        },
      });
    });
  }
}