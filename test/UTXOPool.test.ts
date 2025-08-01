// add new UTXOs
// return list of UTXOs belonging to a particular wallet

import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Wallet } from '../src/Wallet';
import { generatePair } from '../src/utils/crypto';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';

describe('UTXOPool', () => {
  let blockchain: Blockchain;
  let miner: Wallet;
  beforeEach(() => {
    blockchain = new Blockchain('Bitcoin');
    miner = new Wallet(generatePair());
  });

  it('Should compensate miner according to maxHeightBlock', () => {
    const opts: BlockParams = {
      blockchain,
      parentHash: blockchain.genesis.hash,
    };
    const block = new Block(opts);

    block.mineValidHash();
    blockchain.addBlock(block, miner.getPublicKey());
    blockchain.addBlock(block, miner.getPublicKey());

    const minerBalance = miner.getBalance(blockchain);
    expect(minerBalance).to.equal(16);
  });
});
