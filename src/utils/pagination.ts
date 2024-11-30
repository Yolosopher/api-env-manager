import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaginationParams {
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pageSize: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @IsString({ each: true })
  @IsOptional()
  populate?: string[]; // Added populate parameter
}

export function paginate<T>(
  data: T[],
  { page = 1, pageSize = 10 }: PaginationParams,
) {
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
      include?: Record<string, boolean>; // Added include parameter for population
    }) => Promise<T[]>;
  },
  { page = 1, pageSize = 10, sortBy, sortOrder, populate }: PaginationParams,
  where: Record<string, unknown> = {},
) {
  const skip = (page - 1) * pageSize;
  const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : undefined;
  const include = populate
    ? Object.fromEntries(populate.map((field) => [field, true]))
    : undefined;

  const [totalItems, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include,
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
