import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayMaxSize, IsArray, IsEmail, IsIn, IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { PedidoItemDto } from './pedido-item.dto.js';
export class CreatePedidoDto {
 @IsString() @MinLength(3) @MaxLength(100) nombre!:string;
 @IsString() @Matches(/^\+?[0-9\s()-]{10,20}$/) telefono!:string;
 @IsOptional() @IsEmail() email?:string;
 @IsIn(['delivery','retiro']) tipoEntrega!: 'delivery'|'retiro';
 @ValidateIf(o=>o.tipoEntrega==='delivery') @IsString() @MinLength(5) @MaxLength(180) direccionEntrega?:string;
 @IsIn(['efectivo','transferencia','tarjeta']) metodoPago!: 'efectivo'|'transferencia'|'tarjeta';
 @ValidateIf(o=>o.metodoPago==='efectivo' && o.montoEfectivo!==undefined) @IsNumber() @IsPositive() montoEfectivo?:number;
 @IsOptional() @IsString() @MaxLength(30) codigoCupon?:string;
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({each:true}) @Type(()=>PedidoItemDto) items!:PedidoItemDto[];
}
