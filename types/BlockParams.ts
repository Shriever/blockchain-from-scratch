export interface BlockParams {
  blockchain: any;
  parentHash: string;
  nonce?: string;
  height: number;
  coinbaseBeneficiary?: string;
}