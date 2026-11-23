import { Body, Controller, Get, Post, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { CuponesService } from './cupones.service.js';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';
import { UpdateCuponDto } from './dto/update-cupon.dto.js';

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

  @Patch(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
  return this.cuponesService.desactivar(id);
}
}