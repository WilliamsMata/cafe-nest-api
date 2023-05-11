import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from 'src/auth/decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getUsers(paginationDto);
  }

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
