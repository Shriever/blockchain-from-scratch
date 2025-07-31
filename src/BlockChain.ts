import { maxBy, o, reduce, reverse, unfold, values } from 'ramda';
import { Block } from './Block';
import { UTXO, UTXOPool } from './UTXOPool';

const MINER_REWARD = 16;

export class Blockchain {
  name: string;
  blocks: Record<string, Block> = {};
  genesis: Block;
  utxoPool: UTXOPool;

  constructor(name: string) {
    this.name = name;
    this.genesis = this.createGenesisBlock();
    this.utxoPool = new UTXOPool();
  }

  createGenesisBlock() {
    const opts = {
      blockchain: this,
      parentHash: 'root',
      name: this.name,
      height: 1,
    };
    const block = new Block(opts);
    this.blocks[block.hash] = block;
    return block;
  }

  addBlock(newBlock: Block, minerKey: string) {
    newBlock.mineValidHash();
    this._addBlock(newBlock);

    const utxo = new UTXO(MINER_REWARD, minerKey);
    this.utxoPool.addUTXO(utxo);
  }

  _addBlock(block: Block) {
    if (!block.isValid()) return;
    if (this.containsBlock(block)) return;

    // check that the parent exists
    const parent = this.blocks[block.parentHash];
    if (parent === undefined || parent.height + 1 !== block.height) return;

    this.blocks[block.hash] = block;
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
}
