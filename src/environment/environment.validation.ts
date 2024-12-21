import { IsMongoId, IsObject, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @IsMongoId()
  projectId: string;

  @IsString()
  name: string;

  @IsObject()
  variables: Record<string, string>;
}
