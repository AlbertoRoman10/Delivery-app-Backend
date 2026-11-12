import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductosService {
  create(dto: CreateProductoDto): never {
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

  update(id: string, dto: UpdateProductoDto): never {
    void id;
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  remove(id: string): never {
    void id;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }
}
