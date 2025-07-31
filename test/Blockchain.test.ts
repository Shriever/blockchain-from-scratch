import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';
import { Wallet } from '../src/Wallet';
import { generatePair } from '../src/utils/crypto';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let block1: Block;
  let block2: Block;
  let block3: Block;
  let block4: Block;
  let blocks: Block[];

  let miner: Wallet;

  beforeEach(() => {
    miner = new Wallet(generatePair());

    blockchain = new Blockchain('myblockchain');
    const opts1: BlockParams = {
      blockchain,
      height: 2,
      parentHash: blockchain.genesis.hash,
    };
    block1 = new Block(opts1);
    block1.mineValidHash();

    const opts2: BlockParams = {
      blockchain,
      height: 3,
      parentHash: block1.hash,
    };
    block2 = new Block(opts2);
    block2.mineValidHash();

    const opts3: BlockParams = {
      blockchain,
      height: 4,
      parentHash: block2.hash,
    };
    block3 = new Block(opts3);
    block3.mineValidHash();

    const opts4: BlockParams = {
      blockchain,
      height: 3,
      parentHash: block1.hash,
    };
    block4 = new Block(opts4);
    block4.mineValidHash();

    blocks = [block1, block2, block3, block4];
  });

  it('Should create genesis block', () => {
    expect(blockchain.genesis).to.exist;
  });

  it('Should allow adding blocks', () => {
    const key = miner.getPublicKey();
    blocks.forEach(b => {
        blockchain.addBlock(b, key)
        expect(blockchain.containsBlock(b)).to.be.true;
    })
  });

  it('Should set the longest chain as longest chain', () => {
    const key = miner.getPublicKey();
    blocks.forEach(b => blockchain.addBlock(b, key))

    const longest = blockchain.longestChain();

    expect(longest.length).to.equal(4);
    expect(longest.map(b => b.hash)).to.eql([
      blockchain.genesis.hash,
      block1.hash,
      block2.hash,
      block3.hash,
    ]);
  });
});
