import { IsString, IsOptional } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsOptional()
  keyword: string;
}
