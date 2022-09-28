import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { MailService } from './../mail/mail.service'
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
  ],
  providers: [
    UsersService,
    MailService
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
