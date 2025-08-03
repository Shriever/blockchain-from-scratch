import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Wallet } from '../src/Wallet';
import { generatePair, sign } from '../src/utils/crypto';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';
import { Transaction } from '../src/Transaction';

describe('UTXOPool', () => {
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
          i === 0
            ? blockchain.genesis.hash
            : blocks[blocks.length - 1].hash,
      };

      const block = new Block(opts);
      block.mineValidHash();
      blocks.push(block);
    }
  });

  it('Should compensate miner according to maxHeightBlock', () => {
    const compensationPerBlock = 16;
    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const minerBalance = blockchain.getUserBalance(miner.getPublicKey());
    expect(minerBalance).to.equal(blocks.length * compensationPerBlock);
  });

  it('findByPublicKey() should return array of utxos owned by public key', () => {
    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const maxUtxoPool = blockchain.maxHeightBlock().utxoPool;

    const minerUtxos = maxUtxoPool.findByPublicKey(miner.getPublicKey());

    expect(minerUtxos[0].ownerPublicKey).to.equal(miner.getPublicKey());
    expect(minerUtxos[0].value).to.equal(16);
    expect(minerUtxos.length).to.equal(blocks.length);
  });

  it('isValidTransaction should validate transactions', () => {
    const sender = new Wallet(generatePair())
    const to = new Wallet(generatePair()).getPublicKey();
    const amount = 10;
    const message = 'secret message';
    const signature = sign(message, sender.keyPair.privateKey)

    blockchain.generateTestFunds(100, sender.getPublicKey())

    const validTransaction = new Transaction(sender, to, amount, message, signature)
    const InsufficientFundsTransaction = new Transaction(sender, to, 1000, message, signature)
    const invalidSignatureTransaction = new Transaction(sender, to, amount, message, 'invalid signature')
    const utxoPool = blockchain.maxHeightBlock().utxoPool;

    expect(utxoPool.isValidTransaction(validTransaction).success).to.be.true;
    expect(utxoPool.isValidTransaction(InsufficientFundsTransaction).success).to.be.false;
    expect(utxoPool.isValidTransaction(invalidSignatureTransaction).success).to.be.false;
  })
});
