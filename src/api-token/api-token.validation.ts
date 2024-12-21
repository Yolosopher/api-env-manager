import { IsString, IsOptional } from 'class-validator';

export class CreateApiTokenDto {
  @IsString()
  @IsOptional()
  name?: string;
}
