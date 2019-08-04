import { readFileSync } from 'fs';
import { grammar } from 'ohm-js';
var contents = readFileSync('./src/Kallipolis/Kal.ohm');
// @ts-ignore
var kal = grammar(contents);
export default kal