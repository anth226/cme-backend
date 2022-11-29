import { HDNode } from '@ethersproject/hdnode';

export const BlockchainMicroServiceName = 'BLOCKCHAIN_MS';

export const BlockchainMicroServiceMessages = {
  INGAME_GET_BALANCE: `${BlockchainMicroServiceName}_ingame_get_balance`,
  CRYPTO_GET_WALLET: `${BlockchainMicroServiceName}_crypto_get_wallet`,
  CRYPTO_CREATE_WALLET: `${BlockchainMicroServiceName}_crypto_create_wallet`,
  CRYPTO_TRANSFER_EXTERNAL: `${BlockchainMicroServiceName}_crypto_transfer_external`,
};

export type GetBalanceMsReq = Readonly<{
  userId: number;
}>;

export type GetWalletMsReq = Readonly<{
  userId: number;
}>;

export type GetWalletMsResp = {
  derivationId: string;
  wallet: HDNode;
};

export type CreateWalletMsReq = Readonly<{
  userId: number;
}>;

export type CreateWalletMsResp = {
  derivationId: string;
  wallet: HDNode;
};

export type TransferExternalWalletMsReq = Readonly<{
  userId: number;
  address: string;
  amount: string;
}>;
