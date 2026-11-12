import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precio?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  imagen?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  ingredientes?: string[];

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  elaboracion?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  categoriaId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
