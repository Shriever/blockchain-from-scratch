import { maxBy, o, reduce, reverse, unfold, values } from 'ramda';
import EventEmitter from 'events';
import { Block } from './Block';
import { UTXO } from './UTXOPool';
import { Transaction } from './Transaction';

const MINER_REWARD = 16;

export class Blockchain extends EventEmitter {
  name: string;
  blocks: Record<string, Block> = {};
  genesis: Block;
  mempool: Transaction[] = [];

  constructor(name: string) {
    super();
    this.name = name;
    this.genesis = this.createGenesisBlock();
  }

  createGenesisBlock() {
    const opts = {
      blockchain: this,
      parentHash: 'root',
    };
    const block = new Block(opts);
    block.mineValidHash();
    this.blocks[block.hash] = block;
    return block;
  }

  addBlock(newBlock: Block, minerKey: string) {
    return this._addBlock(newBlock, minerKey);
  }

  _addBlock(block: Block, minerKey: string) {
    if (!block.isValid()) return;
    if (this.containsBlock(block)) return;

    // check that the parent exists
    const parent = this.blocks[block.parentHash];
    if (parent === undefined) return;
    if (this.blocks[block.hash])
      throw new Error('A block with that hash is already in the blockchain.');

    const newUtxoPool = parent.utxoPool.clone();
    block.utxoPool = newUtxoPool;

    // const minerUtxo = new UTXO(MINER_REWARD, minerKey);
    // block.utxoPool.addUTXO(minerUtxo);

    block.transactions.forEach(tx => {
      if (!block.utxoPool.isValidTransaction(tx)) {
        throw new Error('Invalid transaction detected in block!');
      }
    });

    // Remove this blocks transactions from mempool and implement txs
    block.transactions.forEach(tx => {
      const mempoolHashes = this.mempool.map(tx => tx.hash);

      this.mempool.filter(tx => mempoolHashes.includes(tx.hash));
      block.utxoPool.handleTransaction(tx, minerKey);
    });

    block.height = parent.height + 1;

    this.blocks[block.hash] = block;

    return block;
  }

  // @dev doesn't check whether transactions in mempool spend the same utxo twice
  addToMempool(tx: Transaction) {
    const tallestBlockUtxoPool = this.maxHeightBlock().utxoPool;
    const { success, errorMessage } =
      tallestBlockUtxoPool.isValidTransaction(tx);
    if (!success) throw new Error(errorMessage);

    const alreadyInMempool = this.mempool.map(t => t.hash).includes(tx.hash);

    if (alreadyInMempool) throw new Error('Transaction already in mempool.');

    this.emit('transactionAdded', tx);

    this.mempool.push(tx);
  }

  subscribeToTxs() {
    this.on('transactionAdded', ({ tx, mempoolSize }) => {
      console.log(`New TX ${tx.hash} in mempool (size=${mempoolSize})`);
    });
  }

  getUserBalance(publicKey: string) {
    const maxHeightUtxoPool = this.maxHeightBlock().utxoPool;
    const balance = maxHeightUtxoPool.getBalanceByPublicKey(publicKey);

    return balance;
  }

  containsBlock(block: Block) {
    return this.blocks[block.hash] !== undefined;
  }

  maxHeightBlock() {
    const blocks = values(this.blocks);
    const maxByHeight = maxBy<Block>(b => b.height);

    const maxHeightBlock = reduce(maxByHeight, blocks[0], blocks);
    return maxHeightBlock;
  }

  longestChain() {
    const getParent = (x: Block | undefined): false | [Block, Block] => {
      if (!x) {
        return false;
      }

      return [x, this.blocks[x.parentHash]];
    };
    return reverse(unfold(getParent, this.maxHeightBlock()));
  }

  generateTestFunds(amount: number, publicKey: string) {
    const utxo = new UTXO(amount, publicKey);
    this.maxHeightBlock().utxoPool.addUTXO(utxo);
  }
}
