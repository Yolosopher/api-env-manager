/**
 * ProjectService handles all operations related to projects, including
 * creating, retrieving, updating, and deleting projects. It also provides
 * pagination and sorting functionality for retrieving a list of projects
 * associated with a specific user.
 *
 * @module ProjectService
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectNameDto } from './project.validation';
import { paginatePrisma } from 'src/utils/pagination';
import { PaginationParams } from 'src/utils/pagination';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves a paginated list of projects for a specific user.
   *
   * @param userId - The ID of the user whose projects are to be retrieved.
   * @param paginationParams - An object containing pagination and sorting parameters.
   * @returns A promise that resolves to an object containing the paginated projects and metadata.
   */
  async getProjects(
    userId: string,
    { page, pageSize, sortBy, sortOrder }: PaginationParams,
  ) {
    const where = { userId };
    return paginatePrisma(
      this.prisma.project,
      { page, pageSize, sortBy, sortOrder },
      where,
    );
  }

  /**
   * Retrieves a specific project by its ID for a given user.
   *
   * @param userId - The ID of the user requesting the project.
   * @param id - The ID of the project to be retrieved.
   * @returns A promise that resolves to the project object if found, or null if not found.
   */
  async getProjectById(userId: string, id: string) {
    return this.prisma.project.findUnique({ where: { id, userId } });
  }

  /**
   * Creates a new project with the provided data.
   *
   * @param data - The data for the new project, including the user ID.
   * @returns A promise that resolves to the created project object.
   */
  async createProject(data: CreateProjectDto) {
    return this.prisma.project.create({ data });
  }

  /**
   * Deletes a project by its ID for a given user.
   *
   * @param userId - The ID of the user requesting the deletion.
   * @param id - The ID of the project to be deleted.
   * @returns A promise that resolves to a message indicating the deletion was successful.
   * @throws NotFoundException if the project does not exist or the user does not have access.
   */
  async deleteProject(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or you do not have access to this project',
      );
    }

    // delete all environments connected to this project
    await this.prisma.environment.deleteMany({
      where: {
        projectId: id,
      },
    });

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * Updates the name of a project.
   *
   * @param id - The ID of the project to be updated.
   * @param updateProjectNameDto - An object containing the new project name.
   * @returns A promise that resolves to the updated project object.
   */
  async updateProjectName(
    id: string,
    updateProjectNameDto: UpdateProjectNameDto,
  ) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectNameDto,
    });
  }

  /**
   * Adds an environment to a project.
   *
   * @param id - The ID of the project to which the environment will be added.
   * @param environmentId - The ID of the environment to be connected.
   * @returns A promise that resolves to the updated project object.
   */
  async pushEnvironmentToProject(id: string, environmentId: string) {
    return this.prisma.project.update({
      where: {
        id,
      },
      data: {
        environments: {
          connect: { id: environmentId },
        },
      },
    });
  }

  /**
   * Removes an environment from a project.
   *
   * @param id - The ID of the project from which the environment will be removed.
   * @param environmentId - The ID of the environment to be disconnected.
   * @returns A promise that resolves to the updated project object.
   */
  async pullEnvironmentFromProject(id: string, environmentId: string) {
    return this.prisma.project.update({
      where: { id },
      data: {
        environments: {
          disconnect: {
            id: environmentId,
          },
        },
      },
    });
  }
}
