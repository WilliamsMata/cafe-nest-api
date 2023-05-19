import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignUpDto } from './dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    // generate the password
    const hash = await argon.hash(dto.password);

    try {
      // save the new user in the DB
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });

      // send back the jwt
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Incorrect credentials');
    }

    if (user.status === false) {
      throw new ForbiddenException('The user has been removed');
    }

    // compare password
    const passwordMatches = await argon.verify(user.password, dto.password);

    // if password is incorrect throw exception
    if (!passwordMatches) {
      throw new ForbiddenException('Incorrect credential');
    }

    // send back the jwt
    return this.signToken(user.id, user.email);
  }

  revalidateJwt(id: string, email: string) {
    return this.signToken(id, email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    // JWT Payload
    const payload: JwtPayload = { userId, email };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '24h',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
