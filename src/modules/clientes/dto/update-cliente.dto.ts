import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UpdateClienteDto { @IsOptional() @IsString() @MinLength(3) @MaxLength(100) nombre?:string; @IsOptional() @IsString() @Matches(/^\+?[0-9\s()-]{10,20}$/) telefono?:string; @IsOptional() @IsString() @MaxLength(180) direccion?:string; @IsOptional() @IsEmail() email?:string; }
