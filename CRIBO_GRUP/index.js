/** **********************
 * Se ruleaza folosind comanda:
node index.js
************************** */

const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const moment = require('moment');
const { xml2json, js2xml } = require('xml-js');

// Date furnizor
const FurnizorNume = 'TIPOGRAFIA 3B S.R.L.';
const FurnizorCIF = '16203419';
const FurnizorNrRegCom = 'J40/3451/2004';
const FurnizorCapital = '1700';
const FurnizorTara = 'Romania';
const FurnizorJudet = 'B';
const FurnizorAdresa = 'str. Zamora nr. 1, sector 4';

const CONT_MARFA = '707';
const CONT_PRODUSE = '7015';

let dataPrimeiFacturi = '';
let numarulPrimeiFacturi = '';

const content = xml2json(
    fs.readFileSync('input.xml', 'utf8'),
    {compact: true}
);

const facturi = JSON.parse(content)['Facturi']['Factura'];
console.log(facturi);

const xml = js2xml({
    _declaration: { _attributes: { version: '1.0' } },
    Facturi: {
        Factura: facturi
    }
}, { compact: true, ignoreComment: true, spaces: 4 });
fs.writeFile(`./output.xml`, xml, (err) => {
    if (err) return console.log(err);
    console.log('File successfully processed!!!');
});