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
import { CreateEnvironmentDto } from './environment.dto';

@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('environment/:id')
  async getEnvironmentById(
    @Req() req: RequestWithUser,
    @Param('id') environmentId: string,
  ) {
    const userId = req.user.id; // to verify that the user has access to the environment
    return this.environmentService.getEnvironmentById(userId, environmentId);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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
