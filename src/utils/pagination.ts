export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function paginate<T>(data: T[], { page, pageSize }: PaginationParams) {
  const offset = (page - 1) * pageSize;
  const paginatedItems = data.slice(offset, offset + pageSize);
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: paginatedItems,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    },
  };
}

export async function paginatePrisma<T>(
  model: {
    count: (args: { where: Record<string, unknown> }) => Promise<number>;
    findMany: (args: {
      where: Record<string, unknown>;
      skip: number;
      take: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
    }) => Promise<T[]>;
  },
  { page, pageSize, sortBy, sortOrder }: PaginationParams,
  where: Record<string, unknown> = {},
) {
  const skip = (page - 1) * pageSize;
  const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : undefined;

  const [totalItems, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    },
  };
}

// You can use the `paginatePrisma` function in other services to handle pagination for any Prisma model.
// Here's an example of how to use it in a service:

// import { paginatePrisma } from 'src/utils/pagination';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class SomeService {
//   constructor(private prisma: PrismaService) {}

//   async getPaginatedItems(page: number, pageSize: number) {
//     const where = { deleted: false }; // Example filter condition
//     return paginatePrisma(this.prisma.someModel, { page, pageSize }, where);
//   }
// }

// In this example, replace `someModel` with the actual Prisma model you want to paginate.
// The `where` object can be customized to include any filter conditions you need.
