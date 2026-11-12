import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { UsersModule } from '../users/users.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { CategoriasModule } from '../categorias/categorias.module.js';
import { ProductosModule } from '../productos/productos.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { PedidosModule } from '../pedidos/pedidos.module.js';
import { CuponesModule } from '../cupones/cupones.module.js';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CategoriasModule,
    ProductosModule,
    ClientesModule,
    PedidosModule,
    CuponesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}