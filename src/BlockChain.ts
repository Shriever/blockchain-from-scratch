import { Block } from './Block';

export class Blockchain {
  name: string;
  blocks: Record<string, Block> = {};
  genesis: Block;

  constructor(name: string) {
    this.name = name;
    this.genesis = this.createGenesisBlock();
  }

  createGenesisBlock() {
    const block = new Block(this, 'root', this.name);
    this.blocks[block.hash] = block;
    return block;
  }

  addBlock(newBlock: Block) {
    this._addBlock(newBlock);
  }

  _addBlock(block: Block) {
    if (!block.isValid()) return;
    if (this.containsBlock(block)) return;

    // check that the parent exists
    const parent = this.blocks[block.parentHash];
    if (parent === undefined) return;

    this.blocks[block.hash] = block;
  }

  containsBlock(block: Block) {
    return this.blocks[block.hash] !== undefined;
  }
}
