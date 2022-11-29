import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

import {
  GetBalanceMsReq,
  BlockchainMicroServiceMessages,
  TransferExternalWalletMsReq,
} from 'apps/blockchain-ms/src/service-messages';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiBearerAuth()
@Controller('mkc')
export class MKCController {
  private blockchainMSClient: ClientProxy;

  constructor() {
    this.blockchainMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'blockchain-ms',
        port: 3005,
      },
    });
  }

  @Get('wallet')
  wallet(@Request() req) {
    const pattern = {
      cmd: BlockchainMicroServiceMessages.INGAME_GET_BALANCE,
    };
    const request: GetBalanceMsReq = {
      userId: req.user.id,
    };

    return this.blockchainMSClient.send<any, GetBalanceMsReq>(pattern, request);
  }

  @Post('withdraw')
  withdraw(@Request() req, @Body() body: WithdrawDto) {
    const pattern = {
      cmd: BlockchainMicroServiceMessages.CRYPTO_TRANSFER_EXTERNAL,
    };
    const request: TransferExternalWalletMsReq = {
      userId: req.user.id,
      address: body.address,
      amount: body.amount,
    };

    return this.blockchainMSClient.send<any, TransferExternalWalletMsReq>(
      pattern,
      request,
    );
  }
}
