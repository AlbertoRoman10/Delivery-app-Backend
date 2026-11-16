import { Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';

@Injectable()
export class AuthService {
  register(registerDto: RegisterAuthDto) {
    return { message: 'Usuario registrado', email: registerDto.email };
  }

  login(loginDto: LoginAuthDto) {
    return { message: 'Login correcto', email: loginDto.email };
  }
}