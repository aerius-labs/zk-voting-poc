import {
  Field,
  Provable,
  Struct,
} from 'snarkyjs';
import { PaillierCipher } from '../ph_utils/pallier';

export class UserState extends Struct({
  // Public
  electionID: Field,
  vote_1: PaillierCipher,
  vote_2: PaillierCipher,
}) {}
