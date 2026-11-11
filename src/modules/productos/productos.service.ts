import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/database/database.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
@Injectable() export class ProductsService {
 constructor(private readonly db:DatabaseService){}
 findAll(categoria?:string){return this.db.read('products').filter((p:any)=>(p.activo!==false)&&(!categoria||p.categoria===categoria));}
 findOne(id:string){const p=this.db.read('products').find((x:any)=>x.id===id);if(!p)throw new NotFoundException('Producto no encontrado');return p;}
 async create(dto:CreateProductoDto){if(!this.db.read('categories').some((c:any)=>c.id===dto.categoria))throw new BadRequestException('La categoría indicada no existe');const id=dto.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'-'+randomUUID().slice(0,8);const p={id,...dto,activo:dto.activo??true};await this.db.update('products',[...this.db.read('products'),p]);return p;}
 async update(id:string,dto:UpdateProductoDto){const rows=this.db.read('products');const i=rows.findIndex((x:any)=>x.id===id);if(i<0)throw new NotFoundException('Producto no encontrado');if(dto.categoria&&!this.db.read('categories').some((c:any)=>c.id===dto.categoria))throw new BadRequestException('La categoría indicada no existe');rows[i]={...rows[i],...dto};await this.db.update('products',rows);return rows[i];}
 async remove(id:string){const rows=this.db.read('products');const i=rows.findIndex((x:any)=>x.id===id);if(i<0)throw new NotFoundException('Producto no encontrado');rows[i].activo=false;await this.db.update('products',rows);return {message:'Producto desactivado'};}
}
