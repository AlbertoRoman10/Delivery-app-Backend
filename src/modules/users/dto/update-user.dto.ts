
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

// Permite modificar uno o varios datos del usuario.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
