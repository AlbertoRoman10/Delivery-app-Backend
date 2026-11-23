$ErrorActionPreference = 'Stop'

$raiz = (Get-Location).Path
$packagePath = Join-Path $raiz 'package.json'
$schemaPath = Join-Path $raiz 'prisma/schema.prisma'

if (-not (Test-Path $packagePath) -or -not (Test-Path $schemaPath) -or -not (Test-Path (Join-Path $raiz 'src/modules'))) {
    throw 'Ejecuta este script desde la carpeta raiz de Delivery-app-Backend.'
}

$package = Get-Content $packagePath -Raw | ConvertFrom-Json
if ($package.name -ne 'delivery-app-backend') {
    throw 'El package.json no corresponde al proyecto delivery-app-backend.'
}

$schema = Get-Content $schemaPath -Raw
$modelos = @('categorias', 'clientes', 'cupones', 'pedido_productos', 'pedidos', 'productos', 'roles', 'usuarios')
foreach ($modelo in $modelos) {
    if ($schema -notmatch "model\s+$modelo\s*\{") {
        throw "No se encontro el modelo '$modelo' en prisma/schema.prisma. No se modifico ningun archivo."
    }
}

$archivos = [ordered]@{}

$archivos['src/modules/productos/dto/create-producto.dto.ts'] = @'
import { IsInt, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  precio!: number;

  @IsInt()
  @Min(0)
  @Max(100000)
  stock!: number;

  @IsString()
  categoriaId!: string;
}
'@

$archivos['src/modules/productos/dto/update-producto.dto.ts'] = @'
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  precio?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  stock?: number;

  @IsOptional()
  @IsString()
  categoriaId?: string;
}
'@

$archivos['src/modules/categorias/dto/create-categoria.dto.ts'] = @'
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;
}
'@

$archivos['src/modules/categorias/dto/update-categoria.dto.ts'] = @'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;
}
'@

$archivos['src/modules/users/dto/create-user.dto.ts'] = @'
import { IsEmail, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsInt()
  @Min(1)
  rolId!: number;
}
'@

$archivos['src/modules/users/dto/update-user.dto.ts'] = @'
import { IsEmail, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rolId?: number;
}
'@

$archivos['src/modules/auth/dto/create-auth.dto.ts'] = @'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}
'@

$archivos['src/modules/productos/productos.service.ts'] = @'
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
'@

$archivos['src/modules/categorias/categorias.service.ts'] = @'
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
'@

$archivos['src/modules/clientes/clientes.service.ts'] = @'
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
'@

$archivos['src/modules/users/users.service.ts'] = @'
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private validarId(id: number): number {
    if (!Number.isSafeInteger(id) || id <= 0) throw new BadRequestException('El identificador de usuario no es valido.');
    return id;
  }

  private readonly seleccionSegura = {
    id: true,
    email: true,
    rol_id: true,
    roles: { select: { id: true, nombre: true } },
  } as const;

  async create(dto: CreateUserDto) {
    const rol = await this.prisma.roles.findUnique({ where: { id: dto.rolId } });
    if (!rol) throw new NotFoundException('El rol indicado no existe.');
    try {
      const password = await hash(dto.password, 12);
      return await this.prisma.usuarios.create({
        data: { email: dto.email.toLowerCase().trim(), password, rol_id: dto.rolId },
        select: this.seleccionSegura,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario con ese email.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.usuarios.findMany({
      select: { ...this.seleccionSegura, clientes: { select: { id: true, nombre: true, telefono: true } } },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: this.validarId(id) },
      select: { ...this.seleccionSegura, clientes: true },
    });
    if (!usuario) throw new NotFoundException('El usuario no existe.');
    return usuario;
  }

  async update(id: number, dto: UpdateUserDto) {
    const usuarioId = this.validarId(id);
    await this.findOne(usuarioId);
    const data: Prisma.usuariosUpdateInput = {};
    if (dto.email !== undefined) data.email = dto.email.toLowerCase().trim();
    if (dto.password !== undefined) data.password = await hash(dto.password, 12);
    if (dto.rolId !== undefined) {
      const rol = await this.prisma.roles.findUnique({ where: { id: dto.rolId } });
      if (!rol) throw new NotFoundException('El rol indicado no existe.');
      data.roles = { connect: { id: dto.rolId } };
    }
    try {
      return await this.prisma.usuarios.update({ where: { id: usuarioId }, data, select: this.seleccionSegura });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe otro usuario con ese email.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const usuarioId = this.validarId(id);
    await this.findOne(usuarioId);
    const cliente = await this.prisma.clientes.findUnique({ where: { usuario_id: usuarioId } });
    if (cliente) throw new ConflictException('No se puede eliminar un usuario asociado a un cliente.');
    await this.prisma.usuarios.delete({ where: { id: usuarioId } });
    return { mensaje: 'Usuario eliminado correctamente.' };
  }
}
'@

$archivos['src/modules/cupones/cupones.service.ts'] = @'
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
'@

$archivos['src/modules/pedidos/pedidos.service.ts'] = @'
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
'@

$archivos['src/modules/auth/auth.service.ts'] = @'
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
'@

$archivos['src/modules/auth/auth.controller.ts'] = @'
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateAuthDto) {
    return this.authService.create(dto);
  }
}
'@

$archivos['src/modules/cupones/cupones.controller.ts'] = @'
import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { CuponesService } from './cupones.service.js';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';

class CreateCuponDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{3,30}$/)
  codigo!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  descuento!: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post('validar')
  validate(@Body() dto: ValidateCuponDto) {
    return this.cuponesService.validate(dto);
  }

  @Get()
  findAll() {
    return this.cuponesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCuponDto) {
    return this.cuponesService.create(dto);
  }
}
'@

$archivos['.env.example'] = @'
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=delivery_app
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_DE_AL_MENOS_32_CARACTERES
'@

$archivos['src/main.ts'] = @'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(Number(process.env.PORT) || 3000);
}

await bootstrap();
'@

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $raiz "backup-actualizacion-$timestamp"
$creados = 0
$actualizados = 0

foreach ($entrada in $archivos.GetEnumerator()) {
    $ruta = Join-Path $raiz $entrada.Key
    $directorio = Split-Path $ruta -Parent
    if (-not (Test-Path $directorio)) {
        New-Item -ItemType Directory -Path $directorio -Force | Out-Null
    }
    if (Test-Path $ruta) {
        $destinoBackup = Join-Path $backupRoot $entrada.Key
        $directorioBackup = Split-Path $destinoBackup -Parent
        New-Item -ItemType Directory -Path $directorioBackup -Force | Out-Null
        Copy-Item -LiteralPath $ruta -Destination $destinoBackup -Force
        $actualizados++
    } else {
        $creados++
    }
    [System.IO.File]::WriteAllText($ruta, [string]$entrada.Value, [System.Text.UTF8Encoding]::new($false))
}

Write-Host ''
Write-Host 'Actualizacion de Delivery App aplicada.' -ForegroundColor Green
Write-Host "Archivos creados: $creados" -ForegroundColor Cyan
Write-Host "Archivos reemplazados: $actualizados" -ForegroundColor Cyan
if ($actualizados -gt 0) {
    Write-Host "Respaldo anterior: $backupRoot" -ForegroundColor Yellow
}
Write-Host ''
Write-Host 'Siguiente paso: ejecutar npm.cmd run build.' -ForegroundColor Yellow
