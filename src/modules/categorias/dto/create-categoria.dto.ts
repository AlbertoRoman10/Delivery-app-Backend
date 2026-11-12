import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  id!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  @IsString()
  @MaxLength(5)
  numero!: string;

  @IsString()
  @MaxLength(300)
  imagen!: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
