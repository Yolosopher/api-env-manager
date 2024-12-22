import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'types/global';
import { CreateEnvironmentDto } from './environment.validation';
import { ApiTokenGuard } from 'src/auth/guards/api-token.guard';

// Base class with shared functionality
export abstract class BaseEnvironmentController {
  constructor(protected readonly environmentService: EnvironmentService) {}

  @Get('single/:id')
  async getEnvironmentById(
    @Req() req: RequestWithUser,
    @Param('id') environmentId: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the environment
    return this.environmentService.getEnvironmentById(userId, environmentId);
  }

  @Get(':projectId')
  async getEnvironmentsByProjectId(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the project
    return this.environmentService.getEnvironmentsByProjectId(
      userId,
      projectId,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEnvironment(
    @Req() req: RequestWithUser,
    @Body() { name, variables, projectId }: CreateEnvironmentDto,
  ) {
    const userId = req.user.id;
    // Optionally, verify that the user has access to the project
    return this.environmentService.createEnvironment(userId, {
      projectId,
      name,
      variables,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEnvironment(
    @Req() req: RequestWithUser,
    @Param('id') environmentId: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the environment
    return this.environmentService.deleteEnvironment(userId, environmentId);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('environment')
export class EnvironmentController extends BaseEnvironmentController {
  constructor(environmentService: EnvironmentService) {
    super(environmentService);
  }
}

@UseGuards(ApiTokenGuard)
@Controller('api/environment')
export class ApiEnvironmentController extends BaseEnvironmentController {
  constructor(environmentService: EnvironmentService) {
    super(environmentService);
  }
}
