import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
