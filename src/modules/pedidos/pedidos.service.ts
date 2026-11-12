import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';

@Injectable()
export class PedidosService {
  create(dto: CreatePedidoDto): never {
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  findAll(): never {
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  findOne(id: string): never {
    void id;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  updateEstado(id: string, dto: UpdateEstadoPedidoDto): never {
    void id;
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }
}
