import { IsString, Matches } from 'class-validator';

export class ValidateCuponDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{3,30}$/)
  code!: string;
}
