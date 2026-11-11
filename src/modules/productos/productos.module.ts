import { Module } from '@nestjs/common';
import { ProductsController } from './productos.controller.js';
import { ProductsService } from './productos.service.js';
@Module({controllers:[ProductsController],providers:[ProductsService]}) export class ProductsModule {}
