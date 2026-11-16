export type TipoEntrega = 'delivery' | 'retiro';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';
export type EstadoPedido = 'pendiente' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';

export interface PedidoItem {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  cliente: {
    nombre: string;
    telefono: string;
    direccion?: string;
  };
  items: PedidoItem[];
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string;
  metodoPago: MetodoPago;
  codigoCupon?: string;
  descuentoPorcentaje: number;
  subtotal: number;
  descuento: number;
  total: number;
  montoEfectivo?: number;
  estado: EstadoPedido;
  createdAt: string;
  updatedAt: string;
}
