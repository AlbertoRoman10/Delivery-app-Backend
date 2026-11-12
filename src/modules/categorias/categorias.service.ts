import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  create(dto: CreateCategoriaDto): never {
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

  update(id: string, dto: UpdateCategoriaDto): never {
    void id;
    void dto;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }

  remove(id: string): never {
    void id;
    throw new NotImplementedException('Pendiente de integraci�n con la base de datos.');
  }
}
