import { User } from '../user.entity';

export class FilterUserDto {
  page: string;
  pageSize: string;
  search: string;
}

export class ResponseUser {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
  data: User[];
}
