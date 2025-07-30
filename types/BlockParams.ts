export interface BlockParams {
  blockchain: any;
  parentHash: string;
  nonce: number;
}

export interface IBlock {
    blockchain: any;
    nonce: string;
    parentHash: string;
    hash: string;
}