import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnvironmentDto } from './environment.validation';

/**
 * Service responsible for managing environments within projects.
 * Handles creation, retrieval, and deletion of environments, along with access control.
 */
@Injectable()
export class EnvironmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all environments associated with a specific project.
   *
   * @param userId - The ID of the user attempting to access the environments
   * @param projectId - The ID of the project whose environments are to be retrieved
   * @returns A promise that resolves to an array of environment objects
   * @throws ForbiddenException if the user does not have access to the project
   * @throws NotFoundException if no environments are found for the given project ID
   */
  async getEnvironmentsByProjectId(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const environments = await this.prisma.environment.findMany({
      where: { projectId },
    });

    if (environments.length === 0) {
      throw new NotFoundException('No environments found for this project');
    }

    return environments;
  }

  /**
   * Retrieves all environments associated with a project identified by name.
   *
   * @param userId - The ID of the user attempting to access the environments
   * @param projectName - The name of the project whose environments are to be retrieved
   * @returns A promise that resolves to an array of environment objects
   * @throws NotFoundException if the project does not exist or no environments are found
   * @throws ForbiddenException if the user does not have access to the project
   */
  async getEnvironmentsByProjectName(userId: string, projectName: string) {
    const project = await this.prisma.project.findFirst({
      where: { name: projectName, userId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or you do not have access to it',
      );
    }

    const environments = await this.prisma.environment.findMany({
      where: { projectId: project.id },
    });

    if (environments.length === 0) {
      throw new NotFoundException('No environments found for this project');
    }

    return environments;
  }

  /**
   * Creates a new environment for a given project.
   *
   * @param userId - The ID of the user attempting to create the environment
   * @param createEnvironmentDto - The environment creation data
   * @param createEnvironmentDto.projectId - The ID of the project to create the environment in
   * @param createEnvironmentDto.name - The name of the new environment
   * @param createEnvironmentDto.variables - The variables to be stored in the environment
   * @returns A promise that resolves to the created environment object
   * @throws ForbiddenException if the user does not have access to the project
   * @throws ConflictException if an environment with the same name already exists in the project
   */
  async createEnvironment(
    userId: string,
    { projectId, name, variables }: CreateEnvironmentDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const existingEnvironment = await this.prisma.environment.findFirst({
      where: { projectId, name },
    });

    if (existingEnvironment) {
      throw new ConflictException('Environment with this name already exists');
    }

    return this.prisma.environment.create({
      data: {
        name,
        variables,
        project: {
          connect: { id: projectId },
        },
      },
    });
  }

  /**
   * Deletes an environment by its ID.
   *
   * @param userId - The ID of the user attempting to delete the environment
   * @param environmentId - The ID of the environment to be deleted
   * @returns A promise that resolves to the deleted environment object
   * @throws NotFoundException if the environment does not exist
   * @throws ForbiddenException if the user does not have access to the project associated with the environment
   */
  async deleteEnvironment(userId: string, environmentId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: environment.projectId, userId },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.environment.delete({
      where: { id: environmentId },
    });
  }

  /**
   * Retrieves an environment by its ID.
   *
   * @param userId - The ID of the user attempting to retrieve the environment
   * @param environmentId - The ID of the environment to be retrieved
   * @returns A promise that resolves to the environment object
   * @throws NotFoundException if the environment does not exist
   * @throws ForbiddenException if the user does not have access to the project associated with the environment
   */
  async getEnvironmentById(userId: string, environmentId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: environment.projectId, userId },
    });

    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return environment;
  }

  /**
   * Creates a new environment for a project identified by name.
   *
   * @param userId - The ID of the user attempting to create the environment
   * @param projectName - The name of the project to create the environment in
   * @param name - The name of the new environment
   * @param variables - The variables to be stored in the environment
   * @returns A promise that resolves to the created environment object
   * @throws NotFoundException if the project does not exist
   * @throws ForbiddenException if the user does not have access to the project
   * @throws ConflictException if an environment with the same name already exists in the project
   */
  async createEnvironmentByProjectName(
    userId: string,
    projectName: string,
    name: string,
    variables: Record<string, string>,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { name: projectName, userId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or you do not have access to it',
      );
    }

    const existingEnvironment = await this.prisma.environment.findFirst({
      where: { projectId: project.id, name },
    });

    if (existingEnvironment) {
      throw new ConflictException('Environment with this name already exists');
    }

    return this.prisma.environment.create({
      data: {
        name,
        variables,
        project: {
          connect: { id: project.id },
        },
      },
    });
  }

  /**
   * Deletes an environment by its name.
   *
   * @param userId - The ID of the user attempting to delete the environment
   * @param projectName - The name of the project to delete the environment from
   * @param environmentName - The name of the environment to be deleted
   * @returns A promise that resolves to the deleted environment object
   * @throws NotFoundException if the environment does not exist
   * @throws ForbiddenException if the user does not have access to the project associated with the environment
   */
  async deleteEnvironmentByName(
    userId: string,
    projectName: string,
    environmentName: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { name: projectName, userId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or you do not have access to it',
      );
    }

    const environment = await this.prisma.environment.findFirst({
      where: { name: environmentName, projectId: project.id },
      include: { project: true },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    return this.prisma.environment.delete({
      where: { id: environment.id },
    });
  }
}
