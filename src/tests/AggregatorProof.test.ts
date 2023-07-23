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
import { AggregatorProof } from '../circuits/aggregator/AggregatorProof';
import { AggregatorState } from '../circuits/aggregator/AggregatorState';

describe('AggregatorProof', () => {
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

  describe('baseCase', () => {
    it('Should create valid base proof', async () => {
      await UserProof.compile();
      const { verificationKey } = await AggregatorProof.compile();

      const electionID = Field.random();

      const proof = await AggregatorProof.baseCase(
        new AggregatorState({
          electionID: electionID,
          encryptedPk: [
            Field.random(),
            Field.random(),
            Field.random(),
            Field.random(),
          ],
          cipher_1: new PaillierCipher({
            c: Field.random(),
            n_squared: Field.random(),
          }),
          cipher_2: new PaillierCipher({
            c: Field.random(),
            n_squared: Field.random(),
          }),
        })
      );

      const ok = await verify(proof.toJSON(), verificationKey);
      expect(ok).toBe(true);
    });
  });

  describe('stepCase', () => {
    it('Should create valid step proof', async () => {
      await UserProof.compile();

      // the zkapp account
      let userKey = PrivateKey.random();
      let userAddress = userKey.toPublicKey();
      const electionID = Field.random();

      const n_squared = Field.random();

      const vote_1 = new PaillierCipher({
        c: Field.random(),
        n_squared: n_squared,
      });
      const vote_2 = new PaillierCipher({
        c: Field.random(),
        n_squared: n_squared,
      });

      const userProof = await UserProof.generateUserProof(
        new UserState({
          electionID: electionID,
          vote_1: vote_1,
          vote_2: vote_2,
        }),
        userAddress,
        Signature.create(userKey, [electionID])
        // voteWeight:
      );

      const { verificationKey } = await AggregatorProof.compile();

      const encryptedPk = [
        Field.random(),
        Field.random(),
        Field.random(),
        Field.random(),
      ];

      const cipher_1 = new PaillierCipher({
        c: Field.random(),
        n_squared: n_squared,
      });
      const cipher_2 = new PaillierCipher({
        c: Field.random(),
        n_squared: n_squared,
      });
      const proof1 = await AggregatorProof.baseCase(
        new AggregatorState({
          electionID: electionID,
          encryptedPk: [
            Field.random(),
            Field.random(),
            Field.random(),
            Field.random(),
          ],
          cipher_1: cipher_1,
          cipher_2: cipher_2,
        })
      );

      const proof2 = await AggregatorProof.step(
        new AggregatorState({
          electionID: electionID,
          encryptedPk: encryptedPk,
          cipher_1: cipher_1.add(vote_1, vote_1.n_squared),
          cipher_2: cipher_2.add(vote_2, vote_2.n_squared),
        }),
        proof1,
        userProof
      );

      const ok = await verify(proof2.toJSON(), verificationKey);
      expect(ok).toBe(true);
    });
  });
});
