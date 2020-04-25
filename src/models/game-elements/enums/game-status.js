import { EnumGenerator } from '../../../logic/enum-generator';

export const GameStatus = EnumGenerator.generate('Playing', 'ExtraMove', 'FirstWin', 'SecondWin', 'NoMoves');
