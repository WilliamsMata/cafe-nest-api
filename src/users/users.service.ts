import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { validate as uuidValidate } from 'uuid';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dtos';
import { ChangePasswordDto, EditUserDto } from './dto';

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
      this.prisma.user.count({ where: { status: true } }),
    ]);

    const userWithoutPassword = users.map((user) => {
      delete user.password;
      return user;
    });

    return { total, users: userWithoutPassword };
  }

  async getUserById(id: string) {
    const user = await this.getUserByIdPrivate(id);
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

  async changeUserPassword(id: string, dto: ChangePasswordDto) {
    const user = await this.getUserByIdPrivate(id);

    const isPasswordValid = await argon.verify(user.password, dto.oldPassword);

    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    try {
      const hashedPassword = await argon.hash(dto.newPassword);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return {
        isOk: true,
        message: 'The password has been successfully updated',
      };
    } catch (error) {
      return {
        isOk: false,
        message: 'An error has occurred, please try again',
      };
    }
  }

  async deleteUserById(id: string) {
    await this.getUserByIdPrivate(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: false },
    });

    return {
      isOk: true,
      message: 'User have been deleted',
      user,
    };
  }

  private async getUserByIdPrivate(id: string): Promise<User> {
    if (!uuidValidate(id)) throw new BadRequestException('Invalid UUID');

    const user = this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
