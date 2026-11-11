import { Module } from '@nestjs/common';
import { CategoriesController } from './categorias.controller.js';
import { CategoriesService } from './categorias.service.js';
@Module({controllers:[CategoriesController],providers:[CategoriesService]}) export class CategoriesModule {}
