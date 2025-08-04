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
  handleTransaction(transaction: Transaction, feeReceiverKey: string) {
    const { success, errorMessage } = this.isValidTransaction(transaction);
    if (!success) throw new Error(errorMessage);

    const { sender, amount, to, fee } = transaction;
    const senderUtxos = this.findByPublicKey(sender.getPublicKey());

    const indicesToBurn: number[] = [];

    // Already checked that balance is sufficient
    const amountToBurn = senderUtxos.reduce((total, utxo, i) => {
      if (total >= amount + fee) return total;

      indicesToBurn.push(i);
      return total + utxo.value;
    }, 0);
    const change = amountToBurn - (amount + fee); // return to sender

    // burn utxos
    indicesToBurn.forEach(i => {
      senderUtxos.splice(i);
    });
    this._setUtxos(senderUtxos, sender.getPublicKey());

    // create a new utxo to send to recipient
    const toUtxo = new UTXO(amount, to);
    this.addUTXO(toUtxo);

    const feeUtxo = new UTXO(fee, feeReceiverKey);
    this.addUTXO(feeUtxo);

    // create a new utxo as change to return to sender if there is change
    if (change > 0) {
      const changeUtxo = new UTXO(change, sender.getPublicKey());
      this.addUTXO(changeUtxo);
    }
  }

  isValidTransaction(transaction: Transaction) {
    const { message, signature, sender, amount, fee } = transaction;
    const senderPublicKey = sender.getPublicKey();
    const returnValues = { success: false, errorMessage: '' };

    const isValidSignature = verifySignature(
      message,
      signature,
      senderPublicKey
    );

    const senderBalance = this.getBalanceByPublicKey(senderPublicKey);
    if (senderBalance < amount + fee) {
      returnValues.errorMessage = `Insufficient Balance: Tried to send ${
        amount + fee
      }, but sender only has ${senderBalance}`;
    }

    if (!isValidSignature) returnValues.errorMessage = 'Invalid Signature';

    returnValues.success = returnValues.errorMessage === '';
    return returnValues;
  }

  _setUtxos(utxos: UTXO[], publicKey: string) {
    this.utxos.set(publicKey, utxos);
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
