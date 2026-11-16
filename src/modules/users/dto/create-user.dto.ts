import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString({ message: 'El nombre debe ser un texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    @MaxLength(80, { message: 'El nombre no puede superar los 80 caracteres.' })
    nombre: string;

    @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido.' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un texto.' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    @MinLength(8, {
        message: 'La contraseña debe tener al menos 8 caracteres.',
    })
    @MaxLength(128, {
        message: 'La contraseña no puede superar los 128 caracteres.',
    })
    password: string;
}