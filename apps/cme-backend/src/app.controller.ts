import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Logger } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './auth/dto/login.dto';
import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { MailService } from './mail/mail.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  private logger: Logger = new Logger('AppController');

  @Public()
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @ApiProperty({
    description: `Basic Auth`,
    example: ['admin/admin'],
  })
  @Post('auth/login')
  async login(@Request() req) {
    this.logger.log(
      `Login attempt for user with login => ${req.user.username}`,
    );

    this.mailService.sendAttemptLoginEmail(req.user.username);

    return this.authService.login(req.user);
  }

  @Public()
  @Get('auth/email/request_verification/:email')
  async request_verification(@Param('email') email: string) {
    const user = await this.usersService.get(email);

    this.logger.log(user);

    if (user && user.email_confirmed == false) {
      this.logger.log(
        `Email verification sent for user with email => ${email}`,
      );
      this.mailService.sendVerificationEmail(user);
      return 'Email verification sent';
    } else {
      return 'EMAIL_ALREADY_CONFIRMED_OR_NOT_EXISTING';
    }
  }

  @Public()
  @Get('auth/email/verify/:token')
  async token_verification(@Param('token') token: string) {
    this.logger.log(
      `Email verification attempt for user with token => ${decodeURIComponent(
        token,
      )}`,
    );

    return this.authService.validateToken(decodeURIComponent(token));
  }
}
