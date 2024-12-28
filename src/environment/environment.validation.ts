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

export class CreateEnvironmentByProjectNameDto {
  @IsString()
  projectName: string;

  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase().replaceAll(' ', '_'))
  @MinLength(1)
  name: string;

  @IsObject()
  variables: Record<string, string>;
}

export class GetByProjectNameDto {
  @IsString({
    message: 'Project name is required and must be a string',
  })
  projectName: string;
}
export class GetApiTokenByProjectIdDto {
  @IsMongoId({
    message: 'Project ID is required and must be a valid MongoDB ID',
  })
  projectId: string;
}

export class GetByEnvironmentIdDto {
  @IsString({
    message: 'Environment ID is required and must be a string',
  })
  environmentId: string;
}

export class GetEnvironmentByNameDto {
  @IsString({
    message: 'Project name is required and must be a string',
  })
  projectName: string;

  @IsString({
    message: 'Environment name is required and must be a string',
  })
  environmentName: string;
}
