import { expect } from 'chai';
import { Block } from '../src/Block';
import { Blockchain } from '../src/BlockChain';
import { BlockParams } from '../types/BlockParams';

describe('Block', () => {
  let block1: Block;

  beforeEach(() => {
    const blockchain: Blockchain = new Blockchain('myblockchain');
    const opts1: BlockParams = {
      blockchain,
      height: 2,
      parentHash: blockchain.genesis.hash,
    };
    block1 = new Block(opts1);
    block1.mineValidHash();
  });

  it("toJSON should return the block's properties in JSON", () => {
    const JSON = block1.toJSON();

    expect(JSON.hash).to.equal(block1.hash);
  });
});
