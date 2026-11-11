import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './pedidos.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';
@Controller('pedidos') export class OrdersController {constructor(private readonly service:OrdersService){} @Get() findAll(@Query('estado') estado?:string){return this.service.findAll(estado)} @Get(':id') findOne(@Param('id') id:string){return this.service.findOne(id)} @Post() create(@Body() dto:CreatePedidoDto){return this.service.create(dto)} @Patch(':id/estado') updateStatus(@Param('id') id:string,@Body() dto:UpdateEstadoPedidoDto){return this.service.updateStatus(id,dto)} }
