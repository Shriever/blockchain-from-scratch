import sha256 from 'crypto-js/sha256';
import { BlockParams } from '../types/BlockParams';
import { Blockchain } from './BlockChain';
import { UTXOPool } from './UTXOPool';

const DIFFICULTY = 2;

export class Block {
  blockchain: Blockchain;
  nonce: string;
  parentHash: string;
  hash: string;
  height: number;
  coinbaseBeneficiary: string;

  constructor(opts: BlockParams) {
    const {
      blockchain,
      parentHash,
      nonce = '0',
      height,
      coinbaseBeneficiary
    } = {
        coinbaseBeneficiary: "root",
      ...opts,
    };
    this.blockchain = blockchain;
    this.nonce = nonce;
    this.parentHash = parentHash;
    this.hash = sha256(this.nonce + this.parentHash).toString();
    this.height = height;
    this.coinbaseBeneficiary = coinbaseBeneficiary;
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

//   createChild(coinbaseBeneficiary: string) {
//     return new Block({
//       blockchain: this.blockchain,
//       parentHash: this.hash,
//       height: this.height + 1,
//       coinbaseBeneficiary,
//     });
//   }

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

  toJSON() {
    return {
      nonce: this.nonce,
      parentHash: this.parentHash,
      hash: this.hash,
      height: this.height,
      coinbaseBeneficiary: this.coinbaseBeneficiary
    };
  }
}
