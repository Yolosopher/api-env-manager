import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiTokenService } from './api-token.service';
import { ApiTokenController } from './api-token.controller';

@Module({
  imports: [PrismaModule],
  providers: [ApiTokenService],
  controllers: [ApiTokenController],
})
export class ApiTokenModule {}
