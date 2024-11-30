import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnvironmentDto } from './environment.dto';

@Injectable()
export class EnvironmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all environments associated with a specific project.
   *
   * @param userId - The ID of the user attempting to access the environments.
   * @param projectId - The ID of the project whose environments are to be retrieved.
   * @returns A promise that resolves to an array of environment objects.
   * @throws ForbiddenException if the user does not have access to the project.
   * @throws NotFoundException if no environments are found for the given project ID.
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
      select: {
        id: true,
        name: true,
      },
    });

    if (environments.length === 0) {
      throw new NotFoundException('No environments found for this project');
    }

    return environments;
  }

  /**
   * Creates a new environment for a given project.
   *
   * @param userId - The ID of the user attempting to create the environment.
   * @param createEnvironmentDto - An object containing the project ID, environment name, and variables.
   * @returns A promise that resolves to the created environment object.
   * @throws ForbiddenException if the user does not have access to the project.
   * @throws ConflictException if an environment with the same name already exists in the project.
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
   * @param userId - The ID of the user attempting to delete the environment.
   * @param environmentId - The ID of the environment to be deleted.
   * @returns A promise that resolves to the deleted environment object.
   * @throws NotFoundException if the environment does not exist.
   * @throws ForbiddenException if the user does not have access to the project associated with the environment.
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
   * @param userId - The ID of the user attempting to retrieve the environment.
   * @param environmentId - The ID of the environment to be retrieved.
   * @returns A promise that resolves to the environment object.
   * @throws NotFoundException if the environment does not exist.
   * @throws ForbiddenException if the user does not have access to the project associated with the environment.
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
}
