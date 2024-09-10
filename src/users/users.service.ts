import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.usersRepository.find({
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
    console.log('result', result);
    if (result.affected !== 0) {
      return `User with ID: ${id} has been deleted`;
    }
  }
}
