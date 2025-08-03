import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';
import { Wallet } from '../src/Wallet';
import { generatePair, sign } from '../src/utils/crypto';
import { Transaction } from '../src/Transaction';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let miner: Wallet;
  let blocks: Block[];
  beforeEach(() => {
    let opts: BlockParams;
    blockchain = new Blockchain('Bitcoin');
    miner = new Wallet(generatePair());
    blocks = [];

    for (let i = 0; i < 4; i++) {
      opts = {
        blockchain,
        parentHash:
          i === 0 ? blockchain.genesis.hash : blocks[blocks.length - 1].hash,
      };

      const block = new Block(opts);
      block.mineValidHash();
      blocks.push(block);
    }
  });

  it('Should create genesis block', () => {
    expect(blockchain.genesis).to.exist;
  });

  it('Should allow adding blocks', () => {
    const key = miner.getPublicKey();
    blocks.forEach(b => {
      blockchain.addBlock(b, key);
      expect(blockchain.containsBlock(b)).to.be.true;
    });
  });

  it('Should set the longest chain as longest chain', () => {
    const key = miner.getPublicKey();
    blocks.forEach(b => blockchain.addBlock(b, key));

    const longest = blockchain.longestChain().map(b => b.hash);
    const hashes = blocks.map(b => b.hash);
    hashes.unshift(blockchain.genesis.hash);

    expect(longest).to.eql(hashes);
  });

  it('Should add transactions to the mempool', () => {
    const sender = new Wallet(generatePair());
    const to = new Wallet(generatePair()).getPublicKey();
    const amount = 10;
    const message = 'secret message';
    const signature = sign(message, sender.keyPair.privateKey);

    blockchain.generateTestFunds(100, sender.getPublicKey());

    const transaction = new Transaction(sender, to, amount, message, signature);
    const invalidTransaction = new Transaction(
      sender,
      to,
      1000,
      message,
      signature
    );

    blockchain.addToMempool(transaction);

    expect(blockchain.mempool[0].hash).to.equal(transaction.hash);
    expect(() => blockchain.addToMempool(transaction)).to.throw(
      'Transaction already in mempool.'
    );
    expect(() => blockchain.addToMempool(invalidTransaction)).to.throw(
      'Insufficient Balance'
    );
  });
});
