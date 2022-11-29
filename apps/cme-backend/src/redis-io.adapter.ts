import { INestApplicationContext } from '@nestjs/common';
import { ConfigurationService } from '@app/configuration';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { AuthenticatedSocket } from './authenticated-socket.interface';

export class RedisIoAdapter extends IoAdapter {
  private jwtService: JwtService;
  private configurationService: ConfigurationService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
    this.configurationService = app.get(ConfigurationService);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.use((socket: AuthenticatedSocket, next) => {
      try {
        const decoded = this.jwtService.verify(
          socket.handshake.headers.authorization.replace('Bearer ', ''),
          {
            // TO DO IN PROD ENVIRONMENT
            // set to false
            ignoreExpiration: true,
          },
        );
        console.log(decoded);
        socket.userData = decoded;
        next();
      } catch (err) {
        next(err);
      }
    });

    const redisAdapter = redisIoAdapter(
      this.configurationService.get('db.redis'),
    );
    server.adapter(redisAdapter);

    return server;
  }
}
