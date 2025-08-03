import { expect } from 'chai';
import { Wallet } from '../src/Wallet';
import { generatePair } from '../src/utils/crypto';
import { Blockchain } from '../src/BlockChain';

describe('Wallet', () => {
  it('should send a transaction to the mempool', () => {
    const blockchain = new Blockchain('Bitcoin')
    const sender = new Wallet(generatePair());
    const to = new Wallet(generatePair()).getPublicKey();
    const amount = 10;

    blockchain.generateTestFunds(100, sender.getPublicKey());

    sender.send(blockchain, to, amount);

    expect(blockchain.mempool.length).to.equal(1);
  });
});
