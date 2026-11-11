import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateProductoDto {
 @IsString() @MinLength(2) @MaxLength(100) nombre!:string;
 @IsNumber({maxDecimalPlaces:2}) @IsPositive() precio!:number;
 @IsString() @MaxLength(300) imagen!:string;
 @IsArray() @ArrayMinSize(1) @ArrayMaxSize(30) @IsString({each:true}) ingredientes!:string[];
 @IsString() @MinLength(5) @MaxLength(1000) elaboracion!:string;
 @IsString() @MinLength(2) categoria!:string;
 @IsOptional() @IsBoolean() activo?:boolean;
}
