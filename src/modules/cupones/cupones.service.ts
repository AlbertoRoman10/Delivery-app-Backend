import { Injectable, NotImplementedException } from '@nestjs/common';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';

@Injectable()
export class CuponesService {
  validate(dto: ValidateCuponDto): never {
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }
}
