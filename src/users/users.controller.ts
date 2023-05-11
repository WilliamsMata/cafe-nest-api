import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from 'src/auth/decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query('page') page: string, @Query('perPage') perPage: string) {
    const parsedPage = parseInt(page) || 1;
    const parsedPerPage = parseInt(perPage) || 10;
    return this.usersService.getUsers(parsedPage, parsedPerPage);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
