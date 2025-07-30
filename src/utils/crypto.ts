import elliptic from 'elliptic';
const ec = new elliptic.ec('secp256k1');

export function generatePair() {
  const keypair = ec.genKeyPair();

  return {
    publicKey: keypair.getPublic('hex'),
    privateKey: keypair.getPrivate('hex'),
  };
}

export function sign(message: string, privateKey: string) {
  try {
    const keypair = ec.keyFromPrivate(privateKey, 'hex');
    return keypair.sign(message).toDER('hex');
  } catch (err) {
    return 'invalid signature';
  }
}

export function verifySignature(message: string, signature: string, publicKey: string) {
    try {
        const keypair = ec.keyFromPublic(publicKey, "hex")
        return ec.verify(message, signature, keypair)
    }
    catch (err) {
        return false;
    }
}