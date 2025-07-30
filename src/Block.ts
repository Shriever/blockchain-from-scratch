import sha256 from 'crypto-js/sha256';
import { BlockParams, IBlock } from '../types/BlockParams';
import { Blockchain } from './BlockChain';

const DIFFICULTY = 2;

export class Block implements IBlock {
  blockchain: Blockchain;
  nonce: string;
  parentHash: string;
  hash: string;
  height: number;

  constructor(opts: BlockParams) {
    const {
      blockchain,
      parentHash,
      nonce = '0',
      height,
    } = {
      ...opts,
    };
    this.blockchain = blockchain;
    this.nonce = nonce;
    this.parentHash = parentHash;
    this.hash = sha256(this.nonce + this.parentHash).toString();
    this.height = height;
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
    let i = Number(this.nonce) + 1;
    while (!this.isValid()) {
      this.setNonce(sha256(i.toString()).toString());
      i++;
    }
  }

  toJSON () {
    return {
        nonce: this.nonce,
        parentHash: this.parentHash,
        hash: this.hash,
        height: this.height
    }
  }
}
