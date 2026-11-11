import { IsInt, IsString, Max, Min } from 'class-validator';
export class PedidoItemDto { @IsString() productoId!:string; @IsInt() @Min(1) @Max(50) cantidad!:number; }
