import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @Transform(({ value }) => +value)
  status: number;
}
