import {
    Field,
    isReady,
    Struct,
    Circuit,
} from 'snarkyjs';

// export { ElGamalECC, ElGamalFF, Cipher };
await isReady;
/**
 * ElGamal over an elliptic curve.
 */

export class PaillierCipher extends Struct({
    c: Field,
    n_squared: Field,
}) {
    add(c: PaillierCipher, n_squared: Field): PaillierCipher {
    Circuit.assertEqual(this.n_squared, n_squared);

    let product = this.c.mul(c.c);
    let res = Circuit.if(product.greaterThanOrEqual(n_squared), product.sub(n_squared), product);
    return new PaillierCipher({c: res, n_squared});
    }
}
