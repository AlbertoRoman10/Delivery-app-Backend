import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const host = process.env.DATABASE_HOST;
    const port = Number(process.env.DATABASE_PORT);
    const user = process.env.DATABASE_USER;
    const password = process.env.DATABASE_PASSWORD;
    const database = process.env.DATABASE_NAME;

    if (!host || !user || !database || !process.env.DATABASE_PORT) {
      throw new Error('Faltan variables de entorno para conectar con MySQL.');
    }

    super({
      adapter: new PrismaMariaDb({
        host,
        port,
        user,
        password: password ?? '',
        database,
        allowPublicKeyRetrieval: true,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}