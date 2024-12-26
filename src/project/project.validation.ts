import { Transform } from 'class-transformer';
import { IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase().replaceAll(' ', '_'))
  @MinLength(2)
  name: string;

  @IsMongoId()
  userId: string;
}

export class UpdateProjectNameDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase().replaceAll(' ', '_'))
  @MinLength(2)
  name: string;
}

export class ProjectIdDto {
  @IsMongoId()
  id: string;
}
