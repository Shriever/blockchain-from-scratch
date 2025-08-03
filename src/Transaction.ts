import { SHA256 } from 'crypto-js';
import { Wallet } from './Wallet';
import { verifySignature } from './utils/crypto';
import { UTXOPool } from './UTXOPool';

export class Transaction {
  from: string;
  to: string;
  amount: number;
  hash: string = '';
  message: string;
  signature: string;
  sender: Wallet;

  constructor(
    sender: Wallet,
    to: string,
    amount: number,
    message: string,
    signature: string,
  ) {
    this.sender = sender;
    this.from = this.sender.getPublicKey();
    this.to = to;
    this.amount = amount;
    this.message = message;
    this.signature = signature;
    this._setHash();
  }

  _setHash() {
    this.hash = this._calculateHash();
  }

  _calculateHash() {
    return SHA256(this.from + this.to + this.amount.toString()).toString();
  }
}
