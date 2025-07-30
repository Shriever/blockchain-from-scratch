export interface BlockParams {
  blockchain: any;
  parentHash: string;
  nonce?: string;
  height: number;
  coinbaseBeneficiary?: string;
}

export interface IBlock {
    blockchain: any;
    nonce: string;
    parentHash: string;
    hash: string;
    height: number;
}