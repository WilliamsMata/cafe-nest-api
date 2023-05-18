import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dtos';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return user;
  }

  async editMe(id: string, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
    });

    delete user.password;

    return user;
  }
}
