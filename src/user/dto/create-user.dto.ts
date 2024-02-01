import { IsString, MinLength, IsEmail, IsEnum } from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateUserDto {
  id: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(Status)
  status: Status;
}
