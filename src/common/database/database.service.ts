import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface DatabaseShape {
  categories: Record<string, unknown>[];
  products: Record<string, any>[];
  customers: Record<string, any>[];
  orders: Record<string, any>[];
  coupons: Record<string, any>[];
}

const EMPTY_DATABASE: DatabaseShape = { categories: [], products: [], customers: [], orders: [], coupons: [] };

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly filePath = join(process.cwd(), 'data', 'db.json');
  private data: DatabaseShape = structuredClone(EMPTY_DATABASE);
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    try {
      const raw = await readFile(this.filePath, 'utf8');
      this.data = { ...structuredClone(EMPTY_DATABASE), ...JSON.parse(raw) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await this.persist();
      this.logger.log('Se creó data/db.json');
    }
  }

  read<K extends keyof DatabaseShape>(collection: K): DatabaseShape[K] {
    return structuredClone(this.data[collection]);
  }

  async update<K extends keyof DatabaseShape>(collection: K, value: DatabaseShape[K]): Promise<void> {
    this.data[collection] = structuredClone(value) as never;
    await this.persist();
  }

  private async persist(): Promise<void> {
    const snapshot = JSON.stringify(this.data, null, 2);
    this.writeQueue = this.writeQueue.then(async () => {
      const temporaryPath = `${this.filePath}.tmp`;
      await writeFile(temporaryPath, snapshot, 'utf8');
      await rename(temporaryPath, this.filePath);
    });
    await this.writeQueue;
  }
}
