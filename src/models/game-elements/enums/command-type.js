import { EnumGenerator } from '../../../logic/enum-generator';

export const CommandType = EnumGenerator.generate('Move', 'Activate', 'Roll', 'Save', 'PickFigure');
