import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  numero?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  imagen?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
