/**
 * The ProjectService class manages operations related to projects, such as
 * creating, retrieving, updating, and deleting projects. It also supports
 * pagination and sorting for fetching a list of projects associated with a user.
 *
 * @module ProjectService
 */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectNameDto } from './project.validation';
import { paginatePrisma } from 'src/utils/pagination';
import { PaginationParams } from 'src/utils/pagination';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetches a paginated list of projects for a specific user.
   *
   * @param userId - The ID of the user whose projects are to be fetched.
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
      { page, pageSize, sortBy, sortOrder, populate: ['environments'] },
      where,
    );
  }

  /**
   * Fetches a specific project by its ID for a given user.
   *
   * @param userId - The ID of the user requesting the project.
   * @param id - The ID of the project to be fetched.
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
   * @throws ConflictException if a project with the same name already exists for the user.
   */
  async createProject(data: CreateProjectDto) {
    const existingProject = await this.prisma.project.findFirst({
      where: { userId: data.userId, name: data.name },
    });

    if (existingProject) {
      throw new ConflictException('Project with this name already exists');
    }

    const newProject = await this.prisma.project.create({ data });

    return newProject;
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
      throw new NotFoundException('Project not found');
    }

    // Delete all environments associated with this project
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
}
