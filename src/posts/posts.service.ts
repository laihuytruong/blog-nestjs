import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DeleteResult, Like, Repository, UpdateResult } from 'typeorm';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { FilterPostDto } from './dto/filter-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}
  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    try {
      if (!user) {
        throw new Error('User not found');
      }
      const post = await this.postsRepository.save({
        ...createPostDto,
        user,
      });
      return await this.findOne(post.id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(filterPostDto: FilterPostDto): Promise<{
    page: number;
    pageSize: number;
    totalCount: number;
    data: Post[];
  }> {
    const page = +filterPostDto.page || 1;
    const pageSize = +filterPostDto.pageSize || 10;
    const search = filterPostDto.search || '';
    const category = +filterPostDto.category || null;

    const skip = (page - 1) * pageSize;

    const [posts, totalCount] = await this.postsRepository.findAndCount({
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
      where: [
        { title: Like(`%${search}%`), category: { id: category } },
        { description: Like(`%${search}%`), category: { id: category } },
      ],
      relations: {
        user: true,
        category: true,
      },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });

    return {
      page,
      pageSize,
      totalCount,
      data: posts,
    };
  }

  async findOne(id: number): Promise<Post> {
    return await this.postsRepository.findOne({
      where: { id },
      relations: {
        user: true,
        category: true,
      },
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdateResult> {
    return await this.postsRepository.update(id, updatePostDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.postsRepository.delete(id);
  }
}
