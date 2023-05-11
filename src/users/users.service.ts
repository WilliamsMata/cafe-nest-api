import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page: number, perPage: number) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.user.count(),
    ]);

    return { total, users };
  }
}
