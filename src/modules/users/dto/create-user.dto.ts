
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, {
    message: 'El correo electrónico debe tener un formato válido.',
  })
  @MaxLength(150, {
    message: 'El correo electrónico no puede superar los 150 caracteres.',
  })
  email!: string;

  @IsString({
    message: 'La contraseña debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'La contraseña es obligatoria.',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres.',
  })
  password!: string;

  @IsInt({
    message: 'El rol debe ser un número entero.',
  })
  @Min(1, {
    message: 'El ID del rol debe ser mayor que cero.',
  })
  rolId!: number;
}
