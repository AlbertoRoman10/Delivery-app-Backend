import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
@Injectable() export class CategoriesService {
 constructor(private readonly db: DatabaseService) {}
 findAll() { return this.db.read('categories'); }
 findOne(id: string) { const item = this.db.read('categories').find((x:any)=>x.id===id); if(!item) throw new NotFoundException('Categoría no encontrada'); return item; }
 async create(dto: CreateCategoriaDto) { const rows=this.db.read('categories'); if(rows.some((x:any)=>x.id===dto.id)) throw new ConflictException('Ya existe una categoría con ese ID'); const item={...dto,activa:dto.activa??true}; await this.db.update('categories',[...rows,item]); return item; }
 async update(id:string,dto:UpdateCategoriaDto) { const rows=this.db.read('categories'); const i=rows.findIndex((x:any)=>x.id===id); if(i<0) throw new NotFoundException('Categoría no encontrada'); rows[i]={...rows[i],...dto}; await this.db.update('categories',rows); return rows[i]; }
 async remove(id:string) { const rows=this.db.read('categories'); if(!rows.some((x:any)=>x.id===id)) throw new NotFoundException('Categoría no encontrada'); if(this.db.read('products').some((p:any)=>p.categoria===id)) throw new ConflictException('No se puede eliminar una categoría que tiene productos asociados'); await this.db.update('categories',rows.filter((x:any)=>x.id!==id)); return {message:'Categoría eliminada'}; }
}
