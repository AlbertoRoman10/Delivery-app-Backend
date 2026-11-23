import { IsEmail, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsInt()
  @Min(1)
  rolId!: number;
}