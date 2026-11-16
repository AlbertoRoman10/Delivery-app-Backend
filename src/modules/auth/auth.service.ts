import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  register(registerDto: RegisterDto) {
    return { message: 'Usuario registrado', email: registerDto.email };
  }

  login(loginDto: LoginDto) {
    return { message: 'Login correcto', email: loginDto.email };
  }
}