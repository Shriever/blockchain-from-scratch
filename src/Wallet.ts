// Should create a class with a public and private key
// Should be able to sign messages
// Should have a place to store currency

import { Blockchain } from './BlockChain';
import { Transaction } from './Transaction';
import { sign } from './utils/crypto';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class Wallet {
  keyPair: KeyPair;

  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair;
  }

  signMessage(message: string) {
    sign(message, this.keyPair.privateKey);
  }

  getBalance(blockchain: Blockchain) {
    /**
     * 1. Get the maxHeightBlock
     * 2. Look inside the utxo pool and find array of utxos owned by the given public key
     * 3. compute the balance by adding all utxos in array
     */
    const maxHeightBlock = blockchain.maxHeightBlock();
    const utxos = maxHeightBlock.utxoPool.findByPublicKey(this.getPublicKey());
    const balance = utxos.reduce((total, utxo) => total + utxo.value, 0);

    return balance;
  }

  getPublicKey() {
    return this.keyPair.publicKey;
  }
  send(blockchain: Blockchain, to: string, amount: number) {
    if (amount <= 0) throw new Error('invalid amount');
    const message = 'skibidi toilet';

    const signature = sign(message, this.keyPair.privateKey);
    const transaction = new Transaction(this, to, amount, message, signature);

    // blockchain.addToMempool(transaction, signature, message);
  }
}
