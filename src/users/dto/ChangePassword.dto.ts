import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  newPassword: string;
}
