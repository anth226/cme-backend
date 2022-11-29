import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private logger: Logger = new Logger('AuthService');

  async validateUser(username: string, pass: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOneByUsername(username);

    // Blocking for beta release.
    // if (user && !user.email_confirmed) {
    //   throw new HttpException('ERR_UNAUTHORIZED_EMAIL_NOT_CONFIRMED', 401);
    // }

    if (user && (await bcrypt.compare(pass, user.password))) {
      return _.omit(user, 'password');
    } else {
      throw new HttpException('EMAIL_OR_PASSWORD_ERROR', 401);
    }
  }

  async login(user: User) {
    const { username, id: sub } = user;
    return {
      access_token: this.jwtService.sign({ username, sub }),
    };
  }

  async validateToken(token: string) {
    const user = await this.userRepository.findOneByToken(token);

    if (user) {
      if (user.email_confirmed) {
        //Already confirmed email
        return {
          email_validation: 'EMAIL_ALREADY_CONFIRMED',
        };
      } else {
        //Not confirmed
        this.userRepository.updateUserEmailVerified(user);
        return {
          email_validation: 'EMAIL_CONFIRMED',
        };
      }
    } else {
      //Token not existing
      return {
        email_validation: 'TOKEN_INVALID_VERIFY_LINK_OR_REQUEST_NEW_TOKEN',
      };
    }
  }
}
