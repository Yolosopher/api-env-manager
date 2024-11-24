import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './user.validation';
import { paginatePrisma } from 'src/utils/pagination';
import { User } from '@prisma/client';
import { AuthLoginDto } from 'src/auth/auth.validation';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(
    email: string,
    deleted: boolean = false,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email, deleted } });
  }

  async validateForLogin({
    email,
    password,
  }: AuthLoginDto): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async createUser(user: CreateUserDto): Promise<IUser> {
    const foundByEmail = await this.findByEmail(user.email);
    if (foundByEmail) {
      throw new ConflictException('User already exists');
    }
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = await this.prisma.user.create({
      data: user,
    });

    return rest;
  }

  async findById(id: string, deleted: boolean = false): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id, deleted } });
  }

  async updateUser(id: string, user: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: user });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deleted: true },
    });
  }

  async findAllUsers(
    page: number,
    pageSize: number,
    deleted: boolean = false,
  ): Promise<{
    data: User[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }> {
    const where = { deleted };
    return await paginatePrisma<User>(
      this.prisma.user,
      { page, pageSize },
      where,
    );
  }
}
