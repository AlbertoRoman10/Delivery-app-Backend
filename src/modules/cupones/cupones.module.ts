import { Module } from '@nestjs/common';
import { CouponsController } from './cupones.controller.js';
import { CouponsService } from './cupones.service.js';
@Module({controllers:[CouponsController],providers:[CouponsService]}) export class CouponsModule {}
