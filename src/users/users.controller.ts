import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto, ResponseUser } from './dto/filter-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'config/config';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(@Query() filterUserDto: FilterUserDto): Promise<ResponseUser> {
    return this.usersService.getAll(filterUserDto);
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

  @UseGuards(AuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError =
              'File size is too large. Maximum allowed size is 5MB.';
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const { user, fileValidationError } = req;

    if (fileValidationError) {
      throw new BadRequestException(fileValidationError);
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.usersService.uploadAvatar(
      user.id,
      file.destination + '/' + file.filename,
    );
  }
}
