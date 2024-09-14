import { IsNotEmpty, IsString } from 'class-validator';
import { Category } from 'src/categories/category.entity';
import { User } from 'src/users/user.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  thumbnail: string;

  status: number;

  user: User;

  @IsNotEmpty()
  category: Category;
}
