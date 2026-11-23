import { PartialType } from '@nestjs/mapped-types';
import { CreateCuponDto } from './create-cupon.dto.js';

export class UpdateCuponDto extends PartialType(CreateCuponDto) {}
