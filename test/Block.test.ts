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
      parentHash: blockchain.genesis.hash,
    };
    block1 = new Block(opts1);
    block1.mineValidHash();
  });

  it("toJSON should return the block's properties in JSON", () => {
    const JSON = block1.toJSON();

    expect(JSON.hash).to.equal(block1.hash);
  });

  it('setNonce should update hash', () => {
    const nonce = block1.nonce;
    const hash = block1.hash;

    block1.setNonce('5000');

    expect(nonce).to.not.equal(block1.nonce);
    expect(hash).to.not.equal(block1.hash);
  });

  it('mineValidHash should update the hash and nonce', () => {
    const hash = block1.hash;

    block1.setNonce('5000');
    block1.mineValidHash();

    expect(hash).to.not.equal(block1.hash);
  });
});
