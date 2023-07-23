import { Experimental } from 'snarkyjs';
import { AggregatorState } from './AggregatorState';
import { UserProof } from '../user/UserProof';
import { SelfProof, ZkProgram } from 'snarkyjs/dist/node/lib/proof_system';
import { Proof } from 'snarkyjs/dist/node/lib/circuit';
import { UserState } from '../user/UserState';

export const AggregatorProof = Experimental.ZkProgram({
  publicInput: AggregatorState,

  methods: {
    baseCase: {
      privateInputs: [],
  
      method(publicInput: AggregatorState) { },
    },

    step: {
      privateInputs: [SelfProof, ZkProgram.Proof(UserProof)],

      method(
        publicInput: AggregatorState, 
        earlierProof: SelfProof<AggregatorState, void>, 
        userProof: SelfProof<UserState, void>
      ) {
        earlierProof.verify();
        userProof.verify();

        earlierProof.publicInput.cipher_1.add(userProof.publicInput.vote_1, userProof.publicInput.vote_1.n_squared).c.assertEquals(publicInput.cipher_1.c);
        earlierProof.publicInput.cipher_2.add(userProof.publicInput.vote_2, userProof.publicInput.vote_2.n_squared).c.assertEquals(publicInput.cipher_2.c);

        publicInput.electionID.assertEquals(earlierProof.publicInput.electionID);

        userProof.publicInput.electionID.assertEquals(userProof.publicInput.electionID);
      }
        
    },
  },
});
