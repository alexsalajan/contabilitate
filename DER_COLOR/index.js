/** **********************
 * Se ruleaza folosind comanda:
node index.js
************************** */

const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const moment = require('moment');
const { js2xml } = require('xml-js');

const facturi = [];

// Date furnizor
const FurnizorNume = 'DER COLOR S.R.L.';
const FurnizorCIF = '25761333';
const FurnizorNrRegCom = 'J40/7745/2009';
const FurnizorCapital = '1000';
const FurnizorTara = 'Romania';
const FurnizorJudet = 'B';
const FurnizorAdresa = 'str. Zamora nr. 1, sector 4';

const CONT_MARFA = '707.1';
const CONT_PRODUSE = '7015';

let dataPrimeiFacturi = '';
let numarulPrimeiFacturi = '';

readXlsxFile('./input.xlsx').then(rows => {
    rows.shift();
    rows.sort((a, b) => {
        return a[1].localeCompare(b[1]);
    })
    for (let i = 0; i < rows.length; i++) {
        const [
            tip,
            FacturaNumar,
            _cod,
            ClientNume,
            ClientCIF,
            _tvai,
            _is_ef,
            dataFactura,
            scadentaFactura,
            _nr_bonuri,
            valoareMarfa,
            tvaMarfa,
        ] = rows[i];

        if (!!tip && tip === 'B') {
            continue;
        }

        const lines = [];

        if (!!valoareMarfa && +valoareMarfa !== 0) {
            const Valoare = Math.round(valoareMarfa * 100) / 100;
            const TVA = Math.round(tvaMarfa * 100) / 100;
            lines.push({
                LinieNrCrt: lines.length + 1,
                Gestiune: [],
                NumeGest: [],
                Descriere: 'MARFA',
                CodArticolFurnizor: [],
                CodArticolClient: [],
                CodBare: [],
                InformatiiSuplimentare: [],
                UM: 'Buc',
                Cantitate: Math.sign(valoareMarfa), // Poate fi negativa
                Pret: Math.round(Math.abs(valoareMarfa) * 10000) / 10000, // '136.0000',
                Valoare, // '136.00',
                ProcTVA: '19',
                TVA, // "25.84"
                Cont: CONT_MARFA
            });
        }
        // if (!!valoareProduse && +valoareProduse !== 0) {
        //     const Valoare = Math.round(valoareProduse * 100) / 100;
        //     const TVA = Math.round(tvaProduse * 100) / 100;
        //     lines.push({
        //         LinieNrCrt: lines.length + 1,
        //         Gestiune: [],
        //         NumeGest: [],
        //         Descriere: 'PRODUSE',
        //         CodArticolFurnizor: [],
        //         CodArticolClient: [],
        //         CodBare: [],
        //         InformatiiSuplimentare: [],
        //         UM: 'Buc',
        //         Cantitate: Math.sign(valoareProduse), // Poate fi negativa
        //         Pret: Math.round(Math.abs(valoareProduse) * 10000) / 10000, // '136.0000',
        //         Valoare, // '136.00',
        //         ProcTVA: '19',
        //         TVA, // "25.84"
        //         Cont: CONT_PRODUSE
        //     });
        // }

        const FacturaData = moment(dataFactura, 'DD/MM/YYYY').format('DD-MM-YYYY');
        const FacturaScadenta = moment(scadentaFactura, 'DD/MM/YYYY').format('DD-MM-YYYY');
        dataPrimeiFacturi = dataPrimeiFacturi || FacturaData;
        numarulPrimeiFacturi = numarulPrimeiFacturi || FacturaNumar;
        const factura = {
            Antet: {
                FurnizorNume,
                FurnizorCIF,
                FurnizorNrRegCom,
                FurnizorCapital,
                FurnizorTara,
                FurnizorLocalitate: [],
                FurnizorJudet,
                FurnizorAdresa,
                FurnizorTelefon: [],
                FurnizorMail: [],
                FurnizorBanca: [],
                FurnizorIBAN: [],
                FurnizorInformatiiSuplimentare: [],
                ClientNume,
                ClientInformatiiSuplimentare: [],
                ClientCIF,
                ClientNrRegCom: [],
                ClientJudet: [],
                ClientTara: [],
                ClientLocalitate: [],
                ClientAdresa: [],
                ClientBanca: [],
                ClientIBAN: [],
                ClientTelefon: [],
                ClientMail: [],
                FacturaNumar,
                FacturaData,
                FacturaScadenta,
                FacturaTaxareInversa: [],
                FacturaTVAIncasare: 'NU',
                FacturaMoneda: 'RON',
                FacturaID: [],
                FacturaGreutate: []
            },
            Detalii: {
                Continut: {
                    Linie: lines
                }
            }
        };

        facturi.push(factura);
    };

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
});