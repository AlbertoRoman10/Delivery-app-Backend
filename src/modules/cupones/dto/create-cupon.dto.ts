import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCuponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  codigo!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  descuento!: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
