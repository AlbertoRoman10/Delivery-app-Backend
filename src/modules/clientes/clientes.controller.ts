import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CustomersService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
@Controller('clientes') export class CustomersController {constructor(private readonly service:CustomersService){} @Get() findAll(){return this.service.findAll()} @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreateClienteDto){return this.service.create(dto)} @Patch(':id') update(@Param('id') id:string,@Body() dto:UpdateClienteDto){return this.service.update(id,dto)} @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)} }
