import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Block } from '../src/Block';

describe('Blockchain', () => {
    let blockchain: Blockchain;
  beforeEach(() => {
    blockchain = new Blockchain('myblockchain');
  });
  it('Should create genesis block', () => {
    expect(blockchain.genesis).to.exist;
  });
  it('Should allow adding blocks', () => {
    const block1 = new Block(blockchain, blockchain.genesis.hash);
    block1.mineValidHash();
    
    const block2 = new Block(blockchain, block1.hash);

    block2.mineValidHash();

    blockchain.addBlock(block1);
    blockchain.addBlock(block2);

    expect(blockchain.containsBlock(block1)).to.be.true;
    expect(blockchain.containsBlock(block2)).to.be.true;

  });
});
