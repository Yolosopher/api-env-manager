import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ApiProjectController, ProjectController } from './project.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiTokenModule } from 'src/api-token/api-token.module';

@Module({
  imports: [PrismaModule, ApiTokenModule],
  providers: [ProjectService],
  controllers: [ProjectController, ApiProjectController],
})
export class ProjectModule {}
