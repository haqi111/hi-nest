import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async userStore(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    await this.userService.userStore(createUserDto);

    res.setHeader('X-Custom-Header', 'Registration-Success');

    return res
      .status(201)
      .json({ message: 'Account successfully registered. Please log in.' });
  }
  @Get('detail')
  userList() {
    return this.userService.userList();
  }
  @Get('detail/:id')
  async userDetail(@Param('id') id: string) {
    const user = await this.userService.userDetail(id);
    return user;
  }
  @Get('search')
  async searchUsers(@Query() searchDto: SearchUserDto): Promise<any[]> {
    return this.userService.userSearch(searchDto);
  }
  @Patch('update/:id')
  async userUpdate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    await this.userService.userUpdate(id, updateUserDto);

    res.setHeader('X-Custom-Header', 'Update-Success');

    return res.status(201).json({ message: 'Update Success' });
  }
  @Patch('update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: Response,
  ) {
    await this.userService.updateUserPassword(
      id,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword,
    );
    res.setHeader('X-Custom-Header', 'Update-Success');
    return res.status(HttpStatus.CREATED).json({ message: 'Update Success' });
  }
  @Delete('delete/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.userService.userRemove(id);
    return res.status(201).json({ message: 'Delete Success' });
  }
}
