import { BlockchainMsIngameMKCService } from './services/blockchain-ms-ingame-mkc.service';
import { UserGlobalMKC } from 'apps/cme-backend/src/user-global-mkc/user-global-mkc.entity';
import { BlockchainMsMKCRelayService } from './services/blockchain-ms-mkc-relay.service';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

import {
  GetBalanceMsReq,
  BlockchainMicroServiceMessages,
  GetWalletMsReq,
  CreateWalletMsResp,
  GetWalletMsResp,
  TransferExternalWalletMsReq,
  CreateWalletMsReq,
} from './service-messages';

@Controller()
export class BlockchainMsController {
  constructor(
    private readonly ingameMKCService: BlockchainMsIngameMKCService,
    private readonly relayMKCService: BlockchainMsMKCRelayService,
  ) {}

  /**
   * User's ingame MKC.
   */
  @MessagePattern({ cmd: BlockchainMicroServiceMessages.INGAME_GET_BALANCE })
  async getUserGlobalBalance(req: GetBalanceMsReq): Promise<UserGlobalMKC> {
    return await this.ingameMKCService.getBalance(req.userId);
  }

  /**
   * User's wallet address creation.
   */
  @EventPattern(BlockchainMicroServiceMessages.CRYPTO_CREATE_WALLET)
  async createUserWallet(req: CreateWalletMsReq) {
    this.relayMKCService.createWallet(req.userId);
  }

  @MessagePattern({ cmd: BlockchainMicroServiceMessages.CRYPTO_GET_WALLET })
  async getUserWallet(req: GetWalletMsReq): Promise<GetWalletMsResp> {
    return await this.relayMKCService.getWallet(req.userId);
  }

  /**
   * MKC relay (blockchain connector).
   */
  @MessagePattern({
    cmd: BlockchainMicroServiceMessages.CRYPTO_TRANSFER_EXTERNAL,
  })
  async transferToExternalWallet(req: TransferExternalWalletMsReq) {
    return await this.relayMKCService.transferToExternalWallet(
      req.userId,
      req.address,
      req.amount,
    );
  }
}
