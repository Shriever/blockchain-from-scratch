import { clone } from "ramda";

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

    addUTXO(utxo: UTXO) {
        const list = this.utxos.get(utxo.ownerPublicKey) || [];
        list.push(utxo);
        this.utxos.set(utxo.ownerPublicKey, list);

    }

    findByPublicKey(publicKey: string){
        return this.utxos.get(publicKey) || [];
    }
    
    clone() {
        return new UTXOPool(clone(this.utxos));
    }
}