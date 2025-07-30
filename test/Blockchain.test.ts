import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let block1: Block;
  let block2: Block;
  let block3: Block;
  let block4: Block;
  
  beforeEach(() => {
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
  });

  it('Should create genesis block', () => {
    expect(blockchain.genesis).to.exist;
  });

  it('Should allow adding blocks', () => {
    blockchain.addBlock(block1);
    blockchain.addBlock(block2);

    expect(blockchain.containsBlock(block1)).to.be.true;
    expect(blockchain.containsBlock(block2)).to.be.true;
  });

  it('Should set the longest chain as longest chain', () => {
    
    blockchain.addBlock(block1);
    blockchain.addBlock(block2);
    blockchain.addBlock(block3);
    blockchain.addBlock(block4);

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
