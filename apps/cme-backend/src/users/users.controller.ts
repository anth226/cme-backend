import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../public.decorator';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { User } from './user.entity';
import { validateEmail } from './../regex';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User) private readonly userRepository: UserRepository,
  ) {
    //
  }

  // // @ApiBearerAuth()
  // @Public()
  // @Get()
  // index() {
  //   return this.userRepository.findAll();
  // }

  // @ApiBearerAuth()
  @Public()
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  show(@Param('id') id: string) {
    return this.userRepository.findOne(id).then((u) => u.toJSON());
  }

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() user: CreateUserDto) {
    /*if(validateEmail(user.username)){
      return this.usersService.create(user);
    } else {
      throw new BadRequestException('USERNAME_MUST_BE_A_VALID_EMAIL');
    }*/
    return this.usersService.create(user).then((u) => u.toJSON());
  }
}
