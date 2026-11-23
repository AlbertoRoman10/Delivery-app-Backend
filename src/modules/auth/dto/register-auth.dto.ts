
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsString({
    message: 'El nombre debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El nombre es obligatorio.',
  })
  @MinLength(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  })
  @MaxLength(100, {
    message: 'El nombre no puede superar los 100 caracteres.',
  })
  nombre: string;

  @IsEmail({}, {
    message: 'El correo electrónico debe tener un formato válido.',
  })
  @MaxLength(150, {
    message: 'El correo electrónico no puede superar los 150 caracteres.',
  })
  email: string;

  @IsString({
    message: 'La contraseña debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria.',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @MaxLength(128, {
    message: 'La contraseña no puede superar los 128 caracteres.',
  })
  password: string;

  @IsString({
    message: 'El teléfono debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El teléfono es obligatorio.',
  })
  @MaxLength(30, {
    message: 'El teléfono no puede superar los 30 caracteres.',
  })
  telefono: string;

  @IsString({
    message: 'La dirección debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La dirección es obligatoria.',
  })
  @MaxLength(200, {
    message: 'La dirección no puede superar los 200 caracteres.',
  })
  direccion: string;
}
