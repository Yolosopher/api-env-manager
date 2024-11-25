import { IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsMongoId()
  userId: string;
}

export class UpdateProjectNameDto {
  @IsString()
  @MinLength(2)
  name: string;
}

export class ProjectIdDto {
  @IsMongoId()
  id: string;
}