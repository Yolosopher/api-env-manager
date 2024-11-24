import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GitHubStrategy } from './strategy/github.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, JwtStrategy, GitHubStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
