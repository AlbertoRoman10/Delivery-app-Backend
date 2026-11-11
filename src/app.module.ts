import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database/database.module.js';
import { CategoriesModule } from './modules/categorias/categorias.module.js';
import { ProductsModule } from './modules/productos/productos.module.js';
import { CustomersModule } from './modules/clientes/clientes.module.js';
import { OrdersModule } from './modules/pedidos/pedidos.module.js';
import { CouponsModule } from './modules/cupones/cupones.module.js';
import { AppController } from './app.controller.js';

@Module({
  imports: [DatabaseModule, CategoriesModule, ProductsModule, CustomersModule, OrdersModule, CouponsModule],
  controllers: [AppController],
})
export class AppModule {}
