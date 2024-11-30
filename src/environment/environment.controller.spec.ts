/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentController } from './environment.controller';
import { EnvironmentService } from './environment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateEnvironmentDto } from './environment.dto';
import { RequestWithUser } from 'types/global';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('EnvironmentController', () => {
  let controller: EnvironmentController;
  let service: EnvironmentService;

  const mockEnvironmentService = {
    getEnvironmentsByProjectId: jest.fn(),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
    getEnvironmentById: jest.fn(), // New service method mock
  };

  const mockRequest: RequestWithUser = {
    user: { id: 'userId' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentController],
      providers: [
        {
          provide: EnvironmentService,
          useValue: mockEnvironmentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EnvironmentController>(EnvironmentController);
    service = module.get<EnvironmentService>(EnvironmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEnvironmentsByProjectId', () => {
    it('should return a list of environments', async () => {
      const result = [{ id: 'environmentId', name: 'Test Environment' }];
      mockEnvironmentService.getEnvironmentsByProjectId.mockResolvedValue(
        result,
      );

      const environments = await controller.getEnvironmentsByProjectId(
        mockRequest,
        'projectId',
      );
      expect(environments).toBe(result);
      expect(service.getEnvironmentsByProjectId).toHaveBeenCalledWith(
        'userId',
        'projectId',
      );
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockEnvironmentService.getEnvironmentsByProjectId.mockRejectedValue(
        new ForbiddenException('You do not have access to this project'),
      );

      await expect(
        controller.getEnvironmentsByProjectId(mockRequest, 'projectId'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if no environments found', async () => {
      mockEnvironmentService.getEnvironmentsByProjectId.mockRejectedValue(
        new NotFoundException('No environments found for this project'),
      );

      await expect(
        controller.getEnvironmentsByProjectId(mockRequest, 'projectId'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEnvironment', () => {
    it('should create a new environment', async () => {
      const createEnvironmentDto: CreateEnvironmentDto = {
        projectId: 'projectId',
        name: 'New Environment',
        variables: {},
      };
      const result = { id: 'newEnvironmentId', ...createEnvironmentDto };
      mockEnvironmentService.createEnvironment.mockResolvedValue(result);

      const newEnvironment = await controller.createEnvironment(
        mockRequest,
        createEnvironmentDto,
      );
      expect(newEnvironment).toBe(result);
      expect(service.createEnvironment).toHaveBeenCalledWith(
        'userId',
        createEnvironmentDto,
      );
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockEnvironmentService.createEnvironment.mockRejectedValue(
        new ForbiddenException('You do not have access to this project'),
      );

      const createEnvironmentDto: CreateEnvironmentDto = {
        projectId: 'projectId',
        name: 'New Environment',
        variables: {},
      };

      await expect(
        controller.createEnvironment(mockRequest, createEnvironmentDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if environment with same name exists', async () => {
      mockEnvironmentService.createEnvironment.mockRejectedValue(
        new ConflictException('Environment with this name already exists'),
      );

      const createEnvironmentDto: CreateEnvironmentDto = {
        projectId: 'projectId',
        name: 'New Environment',
        variables: {},
      };

      await expect(
        controller.createEnvironment(mockRequest, createEnvironmentDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteEnvironment', () => {
    it('should delete an environment by ID', async () => {
      const result = { message: 'Environment deleted successfully' };
      mockEnvironmentService.deleteEnvironment.mockResolvedValue(result);

      const deleteResult = await controller.deleteEnvironment(
        mockRequest,
        'environmentId',
      );
      expect(deleteResult).toBe(result);
      expect(service.deleteEnvironment).toHaveBeenCalledWith(
        'userId',
        'environmentId',
      );
    });

    it('should throw NotFoundException if environment not found', async () => {
      mockEnvironmentService.deleteEnvironment.mockRejectedValue(
        new NotFoundException('Environment not found'),
      );

      await expect(
        controller.deleteEnvironment(mockRequest, 'nonExistentId'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockEnvironmentService.deleteEnvironment.mockRejectedValue(
        new ForbiddenException('You do not have access to this project'),
      );

      await expect(
        controller.deleteEnvironment(mockRequest, 'environmentId'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getEnvironmentById', () => {
    it('should return an environment by ID', async () => {
      const result = { id: 'environmentId', name: 'Test Environment' };
      mockEnvironmentService.getEnvironmentById.mockResolvedValue(result);

      const environment = await controller.getEnvironmentById(
        mockRequest,
        'environmentId',
      );
      expect(environment).toBe(result);
      expect(service.getEnvironmentById).toHaveBeenCalledWith(
        'userId',
        'environmentId',
      );
    });

    it('should throw NotFoundException if environment not found', async () => {
      mockEnvironmentService.getEnvironmentById.mockRejectedValue(
        new NotFoundException('Environment not found'),
      );

      await expect(
        controller.getEnvironmentById(mockRequest, 'nonExistentId'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockEnvironmentService.getEnvironmentById.mockRejectedValue(
        new ForbiddenException('You do not have access to this project'),
      );

      await expect(
        controller.getEnvironmentById(mockRequest, 'environmentId'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
