import sha256 from 'crypto-js/sha256';
import { BlockParams, IBlock } from '../types/BlockParams';
import { Blockchain } from './BlockChain';

const DIFFICULTY = 2;

export class Block implements IBlock {
  blockchain: any;
  nonce: string;
  parentHash: string;
  hash: string;

  constructor(
    blockchain: Blockchain,
    parentHash: string,
    nonce: string = sha256(new Date().getTime().toString()).toString()
  ) {
    this.blockchain = blockchain;
    this.nonce = nonce;
    this.parentHash = parentHash;
    this.hash = sha256(this.nonce + this.parentHash).toString();
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
    let i = 0;
    while (!this.isValid()) {
      this.setNonce(sha256(i.toString()).toString());
      console.log(`Nonce: ${this.nonce}`);

      i++;
    }
  }
}
