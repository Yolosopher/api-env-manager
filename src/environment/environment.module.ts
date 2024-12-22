import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import {
  ApiEnvironmentController,
  EnvironmentController,
} from './environment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiTokenModule } from 'src/api-token/api-token.module';

@Module({
  imports: [PrismaModule, ApiTokenModule],
  providers: [EnvironmentService],
  controllers: [EnvironmentController, ApiEnvironmentController],
})
export class EnvironmentModule {}
