/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationParams } from 'src/utils/pagination';
import { CreateProjectDto, ProjectIdDto } from './project.validation';
import { RequestWithUser } from 'types/global';
import { NotFoundException } from '@nestjs/common';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProjectService = {
    getProjects: jest.fn(),
    getProjectById: jest.fn(),
    createProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  const mockRequest: RequestWithUser = {
    user: { id: 'userId' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProjects', () => {
    it('should return a list of projects', async () => {
      const result = [{ id: 'projectId', name: 'Test Project' }];
      mockProjectService.getProjects.mockResolvedValue(result);

      const paginationParams: PaginationParams = { page: 1, pageSize: 10 };
      expect(await controller.getProjects(mockRequest, paginationParams)).toBe(
        result,
      );
      expect(service.getProjects).toHaveBeenCalledWith(
        'userId',
        paginationParams,
      );
    });
  });

  describe('getProjectById', () => {
    it('should return a project by ID', async () => {
      const result = { id: 'projectId', name: 'Test Project' };
      mockProjectService.getProjectById.mockResolvedValue(result);

      const projectIdDto: ProjectIdDto = { id: 'projectId' };
      expect(await controller.getProjectById(mockRequest, projectIdDto)).toBe(
        result,
      );
      expect(service.getProjectById).toHaveBeenCalledWith(
        'userId',
        'projectId',
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectService.getProjectById.mockResolvedValue(null);

      const projectIdDto: ProjectIdDto = { id: 'nonExistentId' };
      await expect(
        controller.getProjectById(mockRequest, projectIdDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'New Project',
        userId: 'userId',
      };
      const result = { id: 'newProjectId', ...createProjectDto };
      mockProjectService.createProject.mockResolvedValue(result);

      expect(
        await controller.createProject(mockRequest, { name: 'New Project' }),
      ).toBe(result);
      expect(service.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        userId: 'userId',
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project by ID', async () => {
      const projectIdDto: ProjectIdDto = { id: 'projectId' };
      const result = { message: 'Project deleted successfully' };
      mockProjectService.deleteProject.mockResolvedValue(result);

      expect(await controller.deleteProject(mockRequest, projectIdDto)).toBe(
        result,
      );
      expect(service.deleteProject).toHaveBeenCalledWith('userId', 'projectId');
    });
  });
});
