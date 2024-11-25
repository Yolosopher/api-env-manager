import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProjects(
    @Req() req: RequestWithUser,
    @Query() paginationParams: PaginationParams,
  ) {
    const userId = req.user.id;
    return this.projectService.getProjects(userId, paginationParams);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProjectById(
    @Req() req: RequestWithUser,
    @Param() { id }: ProjectIdDto,
  ) {
    const userId = req.user.id;
    return this.projectService.getProjectById(userId, id);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post()
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

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProject(
    @Req() req: RequestWithUser,
    @Param() { id }: ProjectIdDto,
  ) {
    const userId = req.user.id;
    return this.projectService.deleteProject(userId, id);
  }
}
