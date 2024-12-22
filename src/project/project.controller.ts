import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationParams } from 'src/utils/pagination';
import { RequestWithUser } from 'types/global';
import { CreateProjectDto, ProjectIdDto } from './project.validation';
import { ApiTokenGuard } from 'src/api-token/guards/api-token.guard';

// Base class with shared functionality
export abstract class BaseProjectController {
  constructor(protected readonly projectService: ProjectService) {}

  @Get()
  async getProjects(
    @Req() req: RequestWithUser,
    @Query() paginationParams: PaginationParams,
  ) {
    const userId = req.user.id;
    return this.projectService.getProjects(userId, paginationParams);
  }

  @Get(':id')
  async getProjectById(
    @Req() req: RequestWithUser,
    @Param() { id }: ProjectIdDto,
  ) {
    const userId = req.user.id;
    const project = this.projectService.getProjectById(userId, id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Req() req: RequestWithUser,
    @Body() createProjectDto: Pick<CreateProjectDto, 'name'>,
  ) {
    const userId = req.user.id;
    return this.projectService.createProject({
      ...createProjectDto,
      userId,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(
    @Req() req: RequestWithUser,
    @Param() { id }: ProjectIdDto,
  ) {
    const userId = req.user.id;
    return this.projectService.deleteProject(userId, id);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController extends BaseProjectController {
  constructor(projectService: ProjectService) {
    super(projectService);
  }
}

@UseGuards(ApiTokenGuard)
@Controller('api/project')
export class ApiProjectController extends BaseProjectController {
  constructor(projectService: ProjectService) {
    super(projectService);
  }
}
