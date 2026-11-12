import { IsIn } from 'class-validator';

export class UpdateEstadoPedidoDto {
  @IsIn(['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'])
  estado!: 'pendiente' | 'confirmado' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';
}
