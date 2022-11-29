import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AuthenticatedSocket } from '../authenticated-socket.interface';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

@Injectable()
@WebSocketGateway()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  @SubscribeMessage('message')
  handleMessage(client: AuthenticatedSocket, payload: any): WsResponse<string> {
    this.logger.log(`Client sent message: ${payload}`);
    return { event: 'test', data: 'juinegr' };
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    client.leave(`user-${client.userData.sub}`);
  }

  handleConnection(client: AuthenticatedSocket, ...args: Array<any>) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('test', { hello: 'from the other side' });
    client.join(`user-${client.userData.sub}`);
  }
}
