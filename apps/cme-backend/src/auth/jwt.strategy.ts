import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
// import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // private usersService: UsersService,
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // TO DO IN PROD ENVIRONMENT
      // set to false
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log(JSON.stringify(payload, null, ''));
    const { sub: id, username } = payload;
    // const { role } = await this.usersService.findOne(id);
    return { id, username, roles: ['user'] };
  }
}
