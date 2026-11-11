import { Body, Controller, Get, Post } from '@nestjs/common';
import { CouponsService } from './cupones.service.js';
import { ValidateCuponDto } from './dto/validate-cupon.dto.js';
@Controller('cupones') export class CouponsController {constructor(private readonly service:CouponsService){} @Get() findAll(){return this.service.findAll()} @Post('validar') validate(@Body() dto:ValidateCuponDto){return this.service.validate(dto.code)} }
