import { maxBy, reduce, reverse, unfold, values } from 'ramda';
import { Block } from './Block';
import { UTXO } from './UTXOPool';

const MINER_REWARD = 16;

export class Blockchain {
  name: string;
  blocks: Record<string, Block> = {};
  genesis: Block;

  constructor(name: string) {
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
    if (this.blocks[block.hash]) throw new Error("A block with that hash is already in the blockchain.");

    block.height = parent.height + 1;
    // this new block should have a new utxo which is a clone of it's parent's utxo
    // plus a new utxo for the miner
    const newUtxoPool = parent.utxoPool.clone();
    block.utxoPool = newUtxoPool;

    const minerUtxo = new UTXO(MINER_REWARD, minerKey)
    block.utxoPool.addUTXO(minerUtxo)

    this.blocks[block.hash] = block;

    // console.log('block before return', block)
    return block;
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
