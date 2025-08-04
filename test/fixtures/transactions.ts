import { Transaction } from '../../src/Transaction';
import { generatePair, sign } from '../../src/utils/crypto';
import { Wallet } from '../../src/Wallet';

const sender = new Wallet(generatePair());
const to = new Wallet(generatePair()).getPublicKey();
const amount = 10;
const message = 'secret message';
const signature = sign(message, sender.keyPair.privateKey);
const fee = 3;

export const tx = new Transaction(sender, to, amount, message, signature, fee);

export const tx1000 = new Transaction(
  sender,
  to,
  1000,
  message,
  signature,
  fee
);

export const invalidSigTx = new Transaction(
  sender,
  to,
  amount,
  message,
  'invalid signature',
  fee
);
