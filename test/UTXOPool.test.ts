import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Wallet } from '../src/Wallet';
import { generatePair } from '../src/utils/crypto';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';

describe('UTXOPool', () => {
  let blockchain: Blockchain;
  let miner: Wallet;
  let block1: Block;
  let block2: Block;
  let block3: Block;
  let block4: Block;
  let blocks: Block[];
  beforeEach(() => {
    blockchain = new Blockchain('Bitcoin');
    miner = new Wallet(generatePair());
    const opts1: BlockParams = {
      blockchain,
      parentHash: blockchain.genesis.hash,
    };
    const block1 = new Block(opts1);
    block1.mineValidHash();
    const opts2: BlockParams = {
      blockchain,
      parentHash: block1.hash,
    };
    const block2 = new Block(opts2);
    block2.mineValidHash();

    const opts3: BlockParams = {
      blockchain,
      parentHash: block2.hash,
    };
    block3 = new Block(opts3);
    block3.mineValidHash();

    const opts4: BlockParams = {
      blockchain,
      parentHash: block1.hash,
    };
    block4 = new Block(opts4);
    block4.mineValidHash();

    blocks = [block1, block2, block3, block4];
  });

  it('Should compensate miner according to maxHeightBlock', () => {
    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const minerBalance = miner.getBalance(blockchain);
    expect(minerBalance).to.equal(48);
  });

  it('UTXOPool.findByPublicKey() should return array of utxos owned by public key', () => {
    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const maxUtxoPool = blockchain.maxHeightBlock().utxoPool;

    const minerUtxos = maxUtxoPool.findByPublicKey(miner.getPublicKey());

    expect(minerUtxos[0].ownerPublicKey).to.equal(miner.getPublicKey());
    expect(minerUtxos[0].value).to.equal(16);
    expect(minerUtxos.length).to.equal(3);
  });
});
