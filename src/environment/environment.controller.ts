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
import { RequestWithUser } from 'src/types/global';
import {
  CreateEnvironmentDto,
  CreateEnvironmentByProjectNameDto,
} from './environment.validation';
import { ApiTokenGuard } from 'src/api-token/guards/api-token.guard';

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
}

@UseGuards(JwtAuthGuard)
@Controller('environment')
export class EnvironmentController extends BaseEnvironmentController {
  constructor(environmentService: EnvironmentService) {
    super(environmentService);
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

@UseGuards(ApiTokenGuard)
@Controller('cli/environment')
export class ApiEnvironmentController extends BaseEnvironmentController {
  constructor(environmentService: EnvironmentService) {
    super(environmentService);
  }
  @Get(':projectName')
  async getEnvironmentsByProjectName(
    @Req() req: RequestWithUser,
    @Param('projectName') projectName: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the project
    return this.environmentService.getEnvironmentsByProjectName(
      userId,
      projectName,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEnvironmentByProjectName(
    @Req() req: RequestWithUser,
    @Body() { projectName, name, variables }: CreateEnvironmentByProjectNameDto,
  ) {
    const userId = req.user.id;
    return this.environmentService.createEnvironmentByProjectName(
      userId,
      projectName,
      name,
      variables,
    );
  }

  @Delete(':projectName/:environmentName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEnvironmentByName(
    @Req() req: RequestWithUser,
    @Param('projectName') projectName: string,
    @Param('environmentName') environmentName: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the environment
    return this.environmentService.deleteEnvironmentByName(
      userId,
      projectName,
      environmentName,
    );
  }
}
