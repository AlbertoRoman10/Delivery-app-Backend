import { Body, Controller, Post } from '@nestjs/common';
import { CuponesService } from './cupones.service.js';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post('validar')
  validate(@Body() dto: ValidateCuponDto) {
    return this.cuponesService.validate(dto);
  }
}
