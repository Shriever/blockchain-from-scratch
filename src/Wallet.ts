// Should create a class with a public and private key
// Should be able to sign messages
// Should have a place to store currency

import { sign } from './utils/crypto';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

class Wallet {
  keyPair: KeyPair;
  balance: number;

  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair;
    this.balance = 0;
  }

  signMessage(message: string) {
    sign(message, this.keyPair.privateKey);
  }

  getBalance() {
    return this.balance;
  }
}
