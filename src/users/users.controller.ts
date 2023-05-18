import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from 'src/auth/decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { EditUserDto } from './dto';

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

  @Get(':id')
  getUserById(@Param('id') id: string) {
    if (!uuidValidate(id)) throw new BadRequestException('Invalid UUID');

    return this.usersService.getUserById(id);
  }

  @Patch()
  editMe(@GetUser('id') id: string, @Body() dto: EditUserDto) {
    return this.usersService.editMe(id, dto);
  }
}
