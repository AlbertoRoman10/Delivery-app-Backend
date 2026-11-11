import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
@Controller('categorias') export class CategoriesController { constructor(private readonly service:CategoriesService){} @Get() findAll(){return this.service.findAll()} @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreateCategoriaDto){return this.service.create(dto)} @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdateCategoriaDto){return this.service.update(id,dto)} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)} }
