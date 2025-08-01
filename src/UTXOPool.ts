import { clone } from 'ramda';
import { Transaction } from './Transaction';
import { verifySignature } from './utils/crypto';

export class UTXO {
  value: number;
  ownerPublicKey: string;

  constructor(value: number, publicKey: string) {
    this.value = value;
    this.ownerPublicKey = publicKey;
  }
}

export class UTXOPool {
  // publicKey -> [UTXO]
  utxos: Map<string, UTXO[]>;

  constructor(utxos = new Map()) {
    this.utxos = utxos;
  }

  // verifies that wallet was initiated by owner
  // and that owner has sufficient funds
  handleTransaction(transaction: Transaction) {
    const { success, errorMessage } = this.isValidTransaction(transaction);
    if (!success) throw new Error(errorMessage);
    const { sender, amount } = transaction;

    const indicesToBurn: number[] = [];
    this.findByPublicKey(sender.getPublicKey()).reduce((total, utxo, i) => {
      if (total >= amount) return total;

      indicesToBurn.push(i);
      return total + utxo.value;
    }, 0);
  }

  isValidTransaction(transaction: Transaction) {
    const { message, signature, sender } = transaction;
    const senderPublicKey = sender.getPublicKey();
    const returnValues = { success: false, errorMessage: '' };

    const isValidSignature = verifySignature(
      message,
      signature,
      senderPublicKey
    );

    const senderBalance = this.getBalanceByPublicKey(senderPublicKey);
    if (senderBalance < transaction.amount)
      returnValues.errorMessage = 'Insufficient Balance';

    if (!isValidSignature) returnValues.errorMessage = 'Invalid Signature';

    returnValues.success = true;
    return returnValues;
  }

  addUTXO(utxo: UTXO) {
    const list = this.utxos.get(utxo.ownerPublicKey) || [];
    list.push(utxo);
    this.utxos.set(utxo.ownerPublicKey, list);
  }

  findByPublicKey(publicKey: string) {
    return this.utxos.get(publicKey) || [];
  }

  getBalanceByPublicKey(publicKey: string) {
    const utxos = this.findByPublicKey(publicKey);
    const balance = utxos.reduce((total, utxo) => total + utxo.value, 0);

    return balance;
  }

  clone() {
    return new UTXOPool(clone(this.utxos));
  }
}
