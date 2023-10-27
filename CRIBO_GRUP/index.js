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

const getCont = (linie) => {
    let cont = '707.1';
    if (!!linie['Descriere']?.['_text'] && (
        linie['Descriere']['_text'].trim().toUpperCase() === 'TRANSPORT' ||
        linie['Descriere']['_text'].trim().toUpperCase() === 'TAXA LIVRARE'
    )) {
        cont = '704';
    }
    if (!!linie['CotaTVA']?.['_text'] && (
        linie['CotaTVA']['_text'].trim() === '0'
    )) {
        cont = '5328.EMAGRO';
    }
    return cont;
}

const FurnizorCIF = 'RO15438697'
let dataPrimeiFacturi = '';
let numarulPrimeiFacturi = '';
facturi.forEach(factura => {
    dataPrimeiFacturi = dataPrimeiFacturi || factura['Antet']['FacturaData']['_text'];
    numarulPrimeiFacturi = numarulPrimeiFacturi || factura['Antet']['FacturaNumar']['_text'];

    if (!!factura?.['Antet']?.['ClientCIF']?.['_text']) {
        factura['Antet']['ClientCIF']['_text'] = factura['Antet']['ClientCIF']['_text'].replace(/ /g, '');
    }

    if (!factura?.['Antet']?.['ClientJudet']?.['_text']) {
        factura['Antet']['ClientJudet'] = {'_text': 'B'};
    }

    if (!!factura?.['Antet']?.['ClientLocalitate']?.['_text']) {
        factura['Antet']['ClientLocalitate']['_text'] = factura['Antet']['ClientLocalitate']['_text'].toUpperCase().replace(/SECTOR(UL)?/, 'BUCURESTI SECTOR');
    }

    if (!!factura?.['Antet']?.['ClientAdresa']?.['_text']) {
        factura['Antet']['ClientAdresa']['_text'] = factura['Antet']['ClientAdresa']['_text'].substring(0, 70);
    }

    if (!!factura?.['Detalii']?.['Continut']?.['Linie']) {
        if (Array.isArray(factura['Detalii']['Continut']['Linie'])) {
            factura['Detalii']['Continut']['Linie'].forEach(linie => {
                linie['Cont'] = { _text: getCont(linie) };
            });
        } else {
            const linie = factura['Detalii']['Continut']['Linie']
            linie['Cont'] = { _text: getCont(linie) };
        }
    }
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