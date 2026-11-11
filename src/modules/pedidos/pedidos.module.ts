import { Module } from '@nestjs/common';
import { OrdersController } from './pedidos.controller.js';
import { OrdersService } from './pedidos.service.js';
@Module({controllers:[OrdersController],providers:[OrdersService]}) export class OrdersModule {}
