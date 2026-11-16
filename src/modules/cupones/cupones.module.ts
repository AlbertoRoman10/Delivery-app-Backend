import { Module } from '@nestjs/common';
import { CuponesController } from './cupones.controller.js';
import { CuponesService } from './cupones.service.js';

@Module({
  controllers: [CuponesController],
  providers: [CuponesService]
})
export class CuponesModule {}
