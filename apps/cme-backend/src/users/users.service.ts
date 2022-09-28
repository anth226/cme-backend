import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { MailService } from '../mail/mail.service';

const HDWallet = require('ethereum-hdwallet');
//please enter new mnemonic and place it only on server (use dummy mnemonic for local development)
const hdwallet = HDWallet.fromMnemonic(
  'tag volcano eight thank tide danger coast health above argue embrace heavy',
);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository) private readonly usersRepository: UserRepository,
    private mailService: MailService,
  ) {
    //
  }

  async create(user: CreateUserDto): Promise<User> {
    const mywallet = hdwallet.derive(`m/44'/60'/0'/0`);
    const getAllUsers: any = await this.usersRepository.findAll();
    console.log('getAllUsers', getAllUsers);
    let derive: any = 1;
    if (getAllUsers.length !== 0) {
      derive = Math.max(...getAllUsers.map((o) => o.derive));
      derive = ++derive;
    }

    user.password = await bcrypt.hash(user.password, 10);
    user.eth_wallet_addresses = `0x${mywallet
      .derive(derive)
      .getAddress()
      .toString('hex')}`;

    user.eth_private_key = `${mywallet
      .derive(derive)
      .getPrivateKey()
      .toString('hex')}`;
    user.derive = Number(derive);
    user.email_verification_token = await bcrypt.hash(user.username+user.password, 10);
    user.password = await bcrypt.hash(user.password, 10);
    //user.email = user.username

    //sending verification email
    this.mailService.sendVerificationEmail(user);
    return this.usersRepository.save(user);
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
