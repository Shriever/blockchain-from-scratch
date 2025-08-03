import { expect } from 'chai';
import { Blockchain } from '../../src/BlockChain';
import { generatePair } from '../../src/utils/crypto';
import { Wallet } from '../../src/Wallet';
import { Block } from '../../src/Block';

describe('Wallet -> Miner -> Blockchain integration', () => {
  it('should send a tx, mine it into a block, and add to blockchain', () => {
    // Add tx to mempool
    const blockchain = new Blockchain('Bitcoin');
    const sender = new Wallet(generatePair());
    const to = new Wallet(generatePair()).getPublicKey();
    const amount = 10;
    const { genesis, mempool } = blockchain;

    blockchain.generateTestFunds(100, sender.getPublicKey());

    const senderBalanceBefore = blockchain
      .maxHeightBlock()
      .utxoPool.getBalanceByPublicKey(sender.getPublicKey());
    const toBalanceBefore = 0;

    sender.send(blockchain, to, amount);

    expect(mempool[0].to).to.equal(to);

    // Mine Block
    const miner = new Wallet(generatePair());

    const block = new Block({
      blockchain,
      parentHash: genesis.hash,
    });
    mempool.forEach(tx => {
      const isValidTx = blockchain
        .maxHeightBlock()
        .utxoPool.isValidTransaction(tx);
      if (isValidTx) {
        block.addTransaction(tx);
      }
    });
    block.mineValidHash();

    // Add Block to Blockchain
    blockchain.addBlock(block, miner.getPublicKey());

    const utxoPool = blockchain.maxHeightBlock().utxoPool;
    const senderBalanceAfter = utxoPool.getBalanceByPublicKey(sender.getPublicKey())
    const toBalanceAfter = utxoPool.getBalanceByPublicKey(to);
    const minerBalance = utxoPool.getBalanceByPublicKey(miner.getPublicKey());

    expect(blockchain.maxHeightBlock()).to.eql(block);
    expect(senderBalanceBefore - amount).to.equal(senderBalanceAfter);
    expect(toBalanceBefore + amount).to.equal(toBalanceAfter);
    expect(minerBalance).to.equal(16)
  });
});
