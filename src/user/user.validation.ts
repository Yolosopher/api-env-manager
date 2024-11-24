import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @ValidateIf((o) => !o.provider && !o.providerId)
  @IsString()
  @MinLength(8)
  password?: string;

  @ValidateIf((o) => !o.password)
  @IsString()
  provider?: string;

  @ValidateIf((o) => !o.password)
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => Object.keys(o).length > 0)
  email?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => Object.keys(o).length > 0)
  fullName?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => Object.keys(o).length > 0)
  password?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => Object.keys(o).length > 0)
  provider?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => Object.keys(o).length > 0)
  providerId?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => Object.keys(o).length > 0)
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  @ValidateIf((o) => Object.keys(o).length > 0)
  deleted?: boolean;
}
