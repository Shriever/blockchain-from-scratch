import { expect } from 'chai';
import { generatePair, sign, verifySignature } from './../src/utils/crypto';

describe('crypto.ts (key pairs)', () => {
  it('should produce a new key pair', () => {
    const keyPair = generatePair();

    expect(keyPair).to.have.property('privateKey');
    expect(keyPair).to.have.property('publicKey');
  });

  it('should sign a message and verify it', () => {
    const keyPair = generatePair();
    const message = 'secret message';

    const signature = sign(message, keyPair.privateKey);

    const success = verifySignature(message, signature, keyPair.publicKey);

    expect(success).to.be.true;

    // rejects an invalid call to verifySignature
    const maliciousSuccess = verifySignature(
      'fjkdls',
      signature,
      keyPair.publicKey
    );
    expect(maliciousSuccess).to.be.false;
  });
});
