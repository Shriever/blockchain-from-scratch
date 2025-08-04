import { expect } from 'chai';
import { Blockchain } from '../src/BlockChain';
import { Wallet } from '../src/Wallet';
import { generatePair, sign } from '../src/utils/crypto';
import { Block } from '../src/Block';
import { BlockParams } from '../types/BlockParams';
import { Transaction } from '../src/Transaction';
import { invalidSigTx, tx, tx1000 } from './fixtures/transactions';

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
          i === 0 ? blockchain.genesis.hash : blocks[blocks.length - 1].hash,
      };

      const block = new Block(opts);
      block.mineValidHash();
      blocks.push(block);
    }
  });

  it('Should compensate miner according to maxHeightBlock', () => {
    const { fee, sender } = tx;

    blockchain.generateTestFunds(100, sender.getPublicKey());

    blocks[0].addTransaction(tx);
    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const minerBalance = blockchain.getUserBalance(miner.getPublicKey());
    expect(minerBalance).to.equal(fee);
  });

  it('findByPublicKey() should return array of utxos owned by public key', () => {
    const { sender, fee } = tx;
    blockchain.generateTestFunds(100, sender.getPublicKey());
    blocks[0].addTransaction(tx);

    blocks.forEach(b => {
      blockchain.addBlock(b, miner.getPublicKey());
    });

    const maxUtxoPool = blockchain.maxHeightBlock().utxoPool;

    const minerUtxos = maxUtxoPool.findByPublicKey(miner.getPublicKey());

    expect(minerUtxos[0].ownerPublicKey).to.equal(miner.getPublicKey());
    expect(minerUtxos[0].value).to.equal(fee);
    expect(minerUtxos.length).to.equal(1);
  });

  it('isValidTransaction should validate transactions', () => {
    const { sender } = tx;
    blockchain.generateTestFunds(100, sender.getPublicKey());

    const utxoPool = blockchain.maxHeightBlock().utxoPool;

    expect(utxoPool.isValidTransaction(tx).success).to.be.true;
    expect(utxoPool.isValidTransaction(tx1000).success).to.be.false;
    expect(utxoPool.isValidTransaction(invalidSigTx).success).to.be.false;
  });

  it('handleTransaction should update balances', () => {
    const { sender, to, amount, fee } = tx;
    blockchain.generateTestFunds(100, sender.getPublicKey());
    const senderBalanceBefore = blockchain.getUserBalance(
      tx.sender.getPublicKey()
    );
    const toBalanceBefore = blockchain.getUserBalance(to);

    blockchain
      .maxHeightBlock()
      .utxoPool.handleTransaction(tx, miner.getPublicKey());
    const senderBalanceAfter = blockchain.getUserBalance(sender.getPublicKey());
    const toBalanceAfter = blockchain.getUserBalance(to);

    expect(senderBalanceBefore - (amount + fee)).to.equal(senderBalanceAfter);
    expect(toBalanceBefore + amount).to.equal(toBalanceAfter);
  });
});
