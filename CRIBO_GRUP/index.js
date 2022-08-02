/** **********************
 * Se ruleaza folosind comanda:
node index.js
************************** */

const fs = require('fs');
const { xml2json, js2xml } = require('xml-js');

const content = xml2json(
    fs.readFileSync('input.xml', 'utf8'),
    {compact: true}
);

const facturi = JSON.parse(content)['Facturi']['Factura'];

const FurnizorCIF = 'RO15438697'
let dataPrimeiFacturi = '';
let numarulPrimeiFacturi = '';
facturi.forEach(factura => {
    if (!!factura?.['Antet']?.['ClientLocalitate']?.['_text']) {
        factura['Antet']['ClientLocalitate']['_text'] = factura['Antet']['ClientLocalitate']['_text'].toUpperCase().replace(/SECTOR(UL)?/, 'BUCURESTI SECTOR');
    }
    dataPrimeiFacturi = dataPrimeiFacturi || factura['Antet']['FacturaData']['_text'];
    numarulPrimeiFacturi = numarulPrimeiFacturi || factura['Antet']['FacturaNumar']['_text'];
});

const xml = js2xml({
    _declaration: { _attributes: { version: '1.0' } },
    Facturi: {
        Factura: facturi
    }
}, { compact: true, ignoreComment: true, spaces: 4 });
fs.writeFile(`./F_${FurnizorCIF}_${numarulPrimeiFacturi}_${dataPrimeiFacturi}.xml`, xml, (err) => {
    if (err) return console.log(err);
    console.log('File successfully processed!!!');
});