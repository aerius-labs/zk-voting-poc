import {
  Field,
  isReady,
  PrivateKey,
  PublicKey,
  shutdown,
  Signature,
  verify,
} from 'snarkyjs';
import { UserProof } from '../circuits/user/UserProof';
import { UserState } from '../circuits/user/UserState';
import { PaillierCipher } from '../circuits/ph_utils/pallier';

describe('UserProof', () => {
  let sk: PrivateKey;
  let pk: PublicKey;

  beforeAll(async () => {
    await isReady;
    sk = PrivateKey.random();
    pk = sk.toPublicKey();
  });

  afterAll(() => {
    setTimeout(() => shutdown(), 0);
  });

  describe('generateUserProof', () => {
    it('Should create valid user proofs', async () => {
      const { verificationKey } = await UserProof.compile();

      // the zkapp account
      let userKey = PrivateKey.random();
      let userAddress = userKey.toPublicKey();
      const electionID = Field.random();

      const proof = await UserProof.generateUserProof(
        new UserState({
          electionID: electionID,
          vote_1: new PaillierCipher({
            c: Field.random(),
            n_squared: Field.random(),
          }),
          vote_2: new PaillierCipher({
            c: Field.random(),
            n_squared: Field.random(),
          }),
        }),
        userAddress,
        Signature.create(userKey, [electionID])
        // voteWeight:
      );

      const ok = await verify(proof.toJSON(), verificationKey);
      expect(ok).toBe(true);
    });
  });
});
