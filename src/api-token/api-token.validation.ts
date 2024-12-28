import { IsString } from 'class-validator';

export class CreateApiTokenDto {
  @IsString({
    message: 'Name is required and must be a string',
  })
  name: string;
}
