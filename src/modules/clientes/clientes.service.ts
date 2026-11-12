import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  create(dto: CreateClienteDto): never {
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

  update(id: string, dto: UpdateClienteDto): never {
    void id;
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  remove(id: string): never {
    void id;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }
}
