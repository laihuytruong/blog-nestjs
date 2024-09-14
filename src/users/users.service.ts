import { Injectable } from '@nestjs/common';
import { Like, Repository, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto, ResponseUser } from './dto/filter-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAll(filterUserDto: FilterUserDto): Promise<ResponseUser> {
    const page = +filterUserDto.page || 1;
    const pageSize = +filterUserDto.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const search = filterUserDto.search || '';

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where: [
        { firstName: Like('%' + search + '%') },
        { lastName: Like('%' + search + '%') },
        { email: Like('%' + search + '%') },
      ],
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });

    return {
      page,
      pageSize,
      totalCount,
      totalPage: Math.ceil(totalCount / pageSize),
      data: users,
    };
  }

  async getOne(id: number): Promise<User> {
    return await this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.usersRepository.update(id, updateUserDto);
    if (result.affected !== 0) {
      return await this.getOne(id);
    }
  }

  async delete(id: number): Promise<string> {
    const result = await this.usersRepository.delete({ id });
    if (result.affected !== 0) {
      return `User with ID: ${id} has been deleted`;
    }
  }

  async uploadAvatar(id: number, avatar: string): Promise<UpdateResult> {
    return await this.usersRepository.update(id, { avatar });
  }
}
