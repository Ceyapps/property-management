import { IsEmail, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsOptional()
  isActive?: boolean;
}
