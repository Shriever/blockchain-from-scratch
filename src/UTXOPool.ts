/*
UTXOPool
UTXO is an unspent transaction output
UTXO is like a contract that says Wallet has x amount to spend
When a transaction takes place, the UTXO is destroyed
A new UTXO is sent to the recipient with the value of the transfer
And a new UTXO is sent to the sender with the value of the original UTXO - Transaction Amount

UTXO should 
- have a currency value and a public key attached to it so we know who the owner is
UTXOPool should
- store current UTXOs
- add a new UTXO (for compensating miners)
 */

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

    constructor() {
        this.utxos = new Map();
    }

    addUTXO(utxo: UTXO) {
        const list = this.utxos.get(utxo.ownerPublicKey) || [];
        list.push(utxo);
        this.utxos.set(utxo.ownerPublicKey, list);
    }

    findByPublicKey(publicKey: string){
        return this.utxos.get(publicKey) || [];
    }

}