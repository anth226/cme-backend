import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

export enum TransferStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum TransferType {
  TO_GAME_WALLET = 'TO_GAME_WALLET',
  TO_EXTERNAL_WALLET = 'TO_EXTERNAL_WALLET',
}

@Entity({ name: 'user_wallet_transfers' })
@Unique(['user', 'transactionHash', 'sourceTransactionHash'])
export class UserWalletTranfer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column()
  type: TransferType;

  @Column()
  status: TransferStatus;

  @Column()
  retries: number;

  @Column({ name: 'transaction_hash' })
  transactionHash: string;

  // Transaction funding the user wallet, only available for TO_GAME_WALLET transfers
  @Column({ name: 'source_transaction_hash' })
  sourceTransactionHash: string;

  @Column({ type: 'decimal', name: 'mkc_amount' })
  mkcAmount: string;

  @Column({ type: 'decimal', name: 'mkc_amount_without_fee' })
  mkcAmountWithoutFee: string;

  @Column({ type: 'decimal', name: 'mkc_fee' })
  mkcFee: string;

  @Column({ name: 'external_wallet_address' })
  externalWalletAddress: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
