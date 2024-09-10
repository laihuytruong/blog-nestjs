import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.usersService.delete(id);
  }
}
