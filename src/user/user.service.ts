/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Gender, Status } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async userStore(dto: CreateUserDto) {
    await this.verifyEmail(dto.email);
    const id = `user-${uuidv4()}`;
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        id,
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        gender: dto.gender,
        status: dto.status,
      },
    });

    return newUser;
  }
  async userList() {
    const user = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        status: true,
      },
    });
    return user;
  }
  async userDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, gender: true, status: true },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }
  async userUpdate(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, gender: true, status: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const dataToUpdate = {
      ...(updateUserDto.name && { name: updateUserDto.name }),
      ...(updateUserDto.email && { email: updateUserDto.email }),
      ...(updateUserDto.gender && { gender: updateUserDto.gender }),
      ...(updateUserDto.status && { status: updateUserDto.status }),
    };

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
  }
  async updateUserPassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ) {
    await this.verifyPassword(id, oldPassword);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });
    return result;
  }
  async userRemove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
  async userSearch(searchDto: SearchUserDto): Promise<any[]> {
    const keyword = searchDto.keyword;
    const isGenderKeyword = Object.values(Gender).includes(keyword as Gender);
    const isStatusKeyword = Object.values(Status).includes(keyword as Status);

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
          ...(isGenderKeyword ? [{ gender: keyword as Gender }] : []),
          ...(isStatusKeyword ? [{ status: keyword as Status }] : []),
        ],
      },
    });

    if (users.length === 0) {
      throw new NotFoundException(`No users found for keyword: ${keyword}`);
    }

    return users;
  }
  async verifyEmail(email: string) {
    const users = await this.prisma.user.findMany({
      where: { email: { equals: email.toLowerCase() } },
    });
    if (users.length > 0) {
      throw new ConflictException('Email Has Been Used');
    }
  }
  async verifyPassword(id: string, oldPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
  }
}
