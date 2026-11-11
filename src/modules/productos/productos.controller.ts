import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './productos.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
@Controller('productos') export class ProductsController {constructor(private readonly service:ProductsService){} @Get() findAll(@Query('categoria') categoria?:string){return this.service.findAll(categoria)} @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreateProductoDto){return this.service.create(dto)} @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdateProductoDto){return this.service.update(id,dto)} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)} }
