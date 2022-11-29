import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { MailService } from '../mail/mail.service';

import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

import {
  BlockchainMicroServiceMessages,
  CreateWalletMsReq,
  CreateWalletMsResp,
} from 'apps/blockchain-ms/src/service-messages';
import { isEmpty } from 'lodash';
import { processName } from '../naming/naming';

@Injectable()
export class UsersService {
  private blockchainMSClient: ClientProxy;

  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
    private mailService: MailService,
  ) {
    this.blockchainMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'blockchain-ms',
        port: 3005,
      },
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    dto.username = processName(dto.username);

    const existingUser = await this.usersRepository.findOneByUsername(
      dto.username,
    );

    if (!isEmpty(existingUser)) {
      throw new HttpException('Username already used.', HttpStatus.BAD_REQUEST);
    }

    const user = new User();

    user.username = dto.username;
    user.password = await bcrypt.hash(dto.password, 10);
    user.email_verification_token = await bcrypt.hash(
      dto.username + dto.password,
      10,
    );

    const createdUser = await this.usersRepository.save(user);

    const request: CreateWalletMsReq = {
      userId: createdUser.id,
    };

    // Creates the wallet asynchronously to avoid blocking the request.
    this.blockchainMSClient.emit<number, CreateWalletMsReq>(
      BlockchainMicroServiceMessages.CRYPTO_CREATE_WALLET,
      request,
    );

    //sending verification email
    this.mailService.sendVerificationEmail(user);

    return Promise.resolve(createdUser);
  }

  async get(username: string) {
    return this.usersRepository.findOneByUsername(username);
  }

  async remove(id: string): Promise<void> {
    // todo:
    //  soft delete
    //  validation
    //  don't remove yourself
    await this.usersRepository.delete(id);
  }
}
