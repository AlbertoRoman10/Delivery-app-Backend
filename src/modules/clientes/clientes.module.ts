import { Module } from '@nestjs/common';
import { CustomersController } from './clientes.controller.js';
import { CustomersService } from './clientes.service.js';
@Module({controllers:[CustomersController],providers:[CustomersService]}) export class CustomersModule {}
