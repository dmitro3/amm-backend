import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { UserTitleEnum } from 'src/modules/users/enums/user-title.enum';

export class CreateAdminDto {
  @ApiProperty({
    required: true,
    enum: UserTitleEnum,
    type: UserTitleEnum,
    description: 'Title of admin',
  })
  @IsNotEmpty()
  title: UserTitleEnum;

  @ApiProperty({
    required: true,
    default: 'fcx-admin@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    default: 'FCX Company',
  })
  @IsNotEmpty()
  @Matches(/^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/)
  company: string;

  @ApiProperty({
    required: true,
    default: 'fcx admin',
  })
  @IsNotEmpty()
  @Matches(/^[^@$#=(){}!^%\/~;*'"`?<>&\-_.,:\+\\\]\[]*$/)
  fullname: string;

  // @ApiProperty({
  //   required: true,
  //   default: '+84123456789',
  // })
  // @IsNotEmpty()
  // @IsPhoneNumber()
  // phone: string;

  @ApiProperty({
    required: false,
    default: 0,
  })
  user_type: number;

  @ApiProperty({
    required: true,
    default: ['0x2a98f128092abbadef25d17910ebe15b8495d0c1', '0x2a98f128092aBBadef25d17910EbE15B8495D0c1'],
  })
  @IsNotEmpty()
  @IsArray()
  @Matches(/^[a-zA-Z0-9]*$/, { each: true })
  wallets: string[];

  @ApiProperty({
    required: true,
    default: [1, 2],
  })
  @IsNotEmpty()
  @IsArray()
  functional_currencies: number[];
}
