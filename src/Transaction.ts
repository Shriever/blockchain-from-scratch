import { SHA256 } from 'crypto-js';

// Transaction: address from, address to, number amount, string hash
class Transaction {
  from: string;
  to: string;
  amount: number;
  hash: string = '';

  constructor(from: string, to: string, amount: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this._setHash();
  }

  _setHash() {
    this.hash = this._calculateHash();
  }

  _calculateHash() {
    return SHA256(this.from + this.to + this.amount.toString()).toString();
  }
}
