import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();

    if (this.findByEmail(email)) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const password = await bcrypt.hash(createUserDto.password, 10);

    const user: User = {
      id: this.nextId++,
      nombre: createUserDto.nombre.trim(),
      email,
      password,
    };

    this.users.push(user);

    return this.removePassword(user);
  }

  findAll() {
    return this.users.map((user) => this.removePassword(user));
  }

  findOne(id: number) {
    const user = this.findUserById(id);
    return this.removePassword(user);
  }

  findByEmail(email: string) {
    return this.users.find(
      (user) => user.email === email.trim().toLowerCase(),
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.findUserById(id);
    const changes = { ...updateUserDto };

    if (changes.email) {
      changes.email = changes.email.trim().toLowerCase();

      const existingUser = this.findByEmail(changes.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    if (changes.password) {
      changes.password = await bcrypt.hash(changes.password, 10);
    }

    Object.assign(user, changes);

    return this.removePassword(user);
  }

  remove(id: number) {
    const user = this.findUserById(id);

    this.users = this.users.filter((item) => item.id !== id);

    return { message: `Usuario #${user.id} eliminado` };
  }

  private findUserById(id: number) {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    return user;
  }

  private removePassword(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
