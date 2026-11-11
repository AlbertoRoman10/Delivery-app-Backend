import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/database/database.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';

type CustomerRecord = {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  findAll(estado?: string) {
    return this.db.read('orders').filter((order: any) => !estado || order.estado === estado);
  }

  findOne(id: string) {
    const order = this.db.read('orders').find((item: any) => item.id === id);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async create(dto: CreatePedidoDto) {
    const products = this.db.read('products');
    const items = dto.items.map((line) => {
      const product = products.find(
        (item: any) => item.id === line.productoId && item.activo !== false,
      );
      if (!product) {
        throw new BadRequestException(
          `El producto ${line.productoId} no existe o no está disponible`,
        );
      }

      const precioUnitario = Number(product.precio);
      return {
        productoId: product.id,
        nombre: product.nombre,
        precioUnitario,
        cantidad: line.cantidad,
        subtotal: precioUnitario * line.cantidad,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    let discountPercent = 0;
    let couponCode: string | undefined;

    if (dto.codigoCupon) {
      const normalizedCode = dto.codigoCupon.trim().toUpperCase();
      const coupon = this.db
        .read('coupons')
        .find((item: any) => item.code === normalizedCode && item.active);
      if (!coupon) {
        throw new BadRequestException('El cupón no es válido o está vencido');
      }
      discountPercent = Number(coupon.discountPercent);
      couponCode = coupon.code;
    }

    const descuento = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
    const total = Math.round((subtotal - descuento) * 100) / 100;
    if (dto.montoEfectivo !== undefined && dto.montoEfectivo < total) {
      throw new BadRequestException(
        'El monto en efectivo debe ser mayor o igual al total',
      );
    }

    const now = new Date().toISOString();
    const customerRows = this.db.read('customers') as CustomerRecord[];
    const normalizedPhone = dto.telefono.replace(/\D/g, '');
    const existingCustomer = customerRows.find(
      (item) => item.telefono.replace(/\D/g, '') === normalizedPhone,
    );

    let savedCustomer: CustomerRecord;
    if (existingCustomer === undefined) {
      savedCustomer = {
        id: randomUUID(),
        nombre: dto.nombre,
        telefono: dto.telefono,
        direccion: dto.direccionEntrega,
        email: dto.email,
        createdAt: now,
        updatedAt: now,
      };
      await this.db.update('customers', [...customerRows, savedCustomer]);
    } else {
      savedCustomer = {
        ...existingCustomer,
        nombre: dto.nombre,
        telefono: dto.telefono,
        direccion: dto.direccionEntrega ?? existingCustomer.direccion,
        email: dto.email ?? existingCustomer.email,
        updatedAt: now,
      };
      await this.db.update(
        'customers',
        customerRows.map((item) =>
          item.id === savedCustomer.id ? savedCustomer : item,
        ),
      );
    }

    const order = {
      id: randomUUID(),
      clienteId: savedCustomer.id,
      cliente: {
        nombre: dto.nombre,
        telefono: dto.telefono,
        direccion: dto.direccionEntrega,
      },
      items,
      tipoEntrega: dto.tipoEntrega,
      direccionEntrega:
        dto.tipoEntrega === 'delivery' ? dto.direccionEntrega : undefined,
      metodoPago: dto.metodoPago,
      codigoCupon: couponCode,
      descuentoPorcentaje: discountPercent,
      subtotal,
      descuento,
      total,
      montoEfectivo: dto.montoEfectivo,
      estado: 'pendiente',
      createdAt: now,
      updatedAt: now,
    };

    await this.db.update('orders', [...this.db.read('orders'), order]);
    return order;
  }

  async updateStatus(id: string, dto: UpdateEstadoPedidoDto) {
    const rows = this.db.read('orders');
    const index = rows.findIndex((item: any) => item.id === id);
    if (index < 0) throw new NotFoundException('Pedido no encontrado');

    const allowedTransitions: Record<string, string[]> = {
      pendiente: ['confirmado', 'cancelado'],
      confirmado: ['preparando', 'cancelado'],
      preparando: ['en_camino', 'entregado', 'cancelado'],
      en_camino: ['entregado', 'cancelado'],
      entregado: [],
      cancelado: [],
    };

    const currentStatus = rows[index].estado;
    if (!allowedTransitions[currentStatus]?.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar el pedido de ${currentStatus} a ${dto.estado}`,
      );
    }

    rows[index] = {
      ...rows[index],
      estado: dto.estado,
      updatedAt: new Date().toISOString(),
    };
    await this.db.update('orders', rows);
    return rows[index];
  }
}
