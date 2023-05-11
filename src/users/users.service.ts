import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return { total, users };
  }
}
