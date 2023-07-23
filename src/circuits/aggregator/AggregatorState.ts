import {
    Field,
    Provable,
    Struct,
} from 'snarkyjs';
import { PaillierCipher } from '../ph_utils/pallier';

export class AggregatorState extends Struct({
    // Public
    electionID: Field, 
    encryptedPk: Provable.Array(Field, 4),
    cipher_1: PaillierCipher,
    cipher_2: PaillierCipher,

}) {}
  