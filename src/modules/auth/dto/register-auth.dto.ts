import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
    Length,
    Matches,
} from 'class-validator';

export class RegisterAuthDto {
    @Transform(({ value }) => value?.trim())
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
    @Matches(/^[\p{L}\s'-]+$/u, {
    message: 'El nombre solo puede contener letras y espacios',
    })
    nombre: string;

    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail({}, { message: 'El email no es válido' })
    email: string;

    @IsString()
    @IsStrongPassword(
    { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    {
        message:
        'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula, número y símbolo',
    },
    )
    password: string;
}