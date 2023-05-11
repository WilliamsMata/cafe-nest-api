import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dtos';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          status: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    const usersWhitoutPassword = users.map((user) => {
      delete user.password;
      return user;
    });

    return { total, users: usersWhitoutPassword };
  }
}
