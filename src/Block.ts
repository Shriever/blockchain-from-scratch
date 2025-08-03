import sha256 from 'crypto-js/sha256';
import { BlockParams } from '../types/BlockParams';
import { Blockchain } from './BlockChain';
import { UTXOPool } from './UTXOPool';
import { Transaction } from './Transaction';

const DIFFICULTY = 1;

export class Block {
  blockchain: Blockchain;
  nonce: string;
  parentHash: string;
  hash: string;
  utxoPool: UTXOPool;
  height: number = 1;
  transactions: Transaction[] = [];

  constructor(opts: BlockParams) {
    const {
      blockchain,
      parentHash,
      nonce = Date.now().toString(),
    } = {
      ...opts,
    };
    this.blockchain = blockchain;
    this.nonce = nonce;
    this.parentHash = parentHash;
    this.hash = sha256(this.nonce + this.parentHash).toString();
    this.utxoPool = new UTXOPool();
  }

  isRoot() {
    return this.parentHash === 'root';
  }

  isValid() {
    return (
      this.isRoot() ||
      (this.hash.substring(0, DIFFICULTY) === '0'.repeat(DIFFICULTY) &&
        this.hash === this._calculateHash())
    );
  }

  _calculateHash() {
    return sha256(this.nonce + this.parentHash).toString();
  }

  _setHash() {
    this.hash = this._calculateHash();
  }

  setNonce(nonce: string) {
    this.nonce = nonce;
    this._setHash();
  }

  mineValidHash() {
    let i = Number(this.nonce);
    while (!this.isValid()) {
      i++;
      this.setNonce(sha256(i.toString()).toString());
    }
  }

  addTransaction(tx: Transaction) {
    this.transactions.push(tx);
  }

  toJSON() {
    return {
      nonce: this.nonce,
      parentHash: this.parentHash,
      hash: this.hash,
      height: this.height,
    };
  }
}
