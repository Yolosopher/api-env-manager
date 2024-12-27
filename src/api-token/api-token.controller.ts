import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTokenService } from './api-token.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateApiTokenDto } from './api-token.validation';
import { RequestWithUser } from 'types/global';

@Controller('api-token')
export class ApiTokenController {
  constructor(private readonly apiTokenService: ApiTokenService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiToken(
    @Req() req: RequestWithUser,
    @Body() createApiTokenDto: CreateApiTokenDto,
  ) {
    return this.apiTokenService.createApiToken(req.user.id, createApiTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getApiTokens(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.apiTokenService.getApiTokens(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiToken(
    @Req() req: RequestWithUser,
    @Param('id') tokenId: string,
  ) {
    return this.apiTokenService.deleteApiToken(req.user.id, tokenId);
  }
}
