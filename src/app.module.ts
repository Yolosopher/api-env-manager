import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { ProjectModule } from './project/project.module';
import { EnvironmentModule } from './environment/environment.module';
import { ApiTokenModule } from './api-token/api-token.module';

const ConfigSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CALLBACK_URL: Joi.string().uri().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigSchema,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      global: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    ProjectModule,
    EnvironmentModule,
    ApiTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
