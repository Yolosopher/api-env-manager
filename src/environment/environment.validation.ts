import { Transform } from 'class-transformer';
import { IsMongoId, IsObject, IsString, MinLength } from 'class-validator';

export class CreateEnvironmentDto {
  @IsMongoId()
  projectId: string;

  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase().replaceAll(' ', '_'))
  @MinLength(1)
  name: string;

  @IsObject()
  variables: Record<string, string>;
}
