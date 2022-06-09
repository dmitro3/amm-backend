import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserTitleEnum } from 'src/modules/users/enums/user-title.enum';

export class CreateUserDto {
  @ApiProperty({
    required: true,
    enum: UserTitleEnum,
    type: UserTitleEnum,
    description: 'Title of user',
  })
  @IsNotEmpty()
  title: UserTitleEnum;

  @ApiProperty({
    required: true,
    default: 'helloworld@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    default: 'hello world',
  })
  @IsNotEmpty()
  @Matches(/^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/)
  company: string;

  @ApiProperty({
    required: true,
    default: 'Hello123',
  })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]{8,30}$/)
  password: string;

  @ApiProperty({
    required: true,
    default: 'lisa',
  })
  @IsNotEmpty()
  @Matches(/^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/)
  fullname: string;

  @ApiProperty({
    required: true,
    default: '+84123456789',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    required: false,
    default: 0,
  })
  user_type: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEmail()
  velo_account: string;

  @ApiProperty({
    required: true,
    default: ['0x2a98f128092abbadef25d17910ebe15b8495d0c1', '0x2a98f128092aBBadef25d17910EbE15B8495D0c2'],
  })
  @IsNotEmpty()
  @IsArray()
  @Matches(/^[^$|\s+][a-zA-Z0-9]*$/, { each: true })
  wallets: string[];

  @ApiProperty({
    required: false,
    default: 0,
  })
  role: number;

  @ApiProperty({
    required: true,
    default: [1, 2],
  })
  @IsNotEmpty()
  @IsArray()
  functional_currencies: number[];
}
