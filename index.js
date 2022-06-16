/** **********************
node index.js ./input.csv 
************************** */

const fs = require('fs');
const { parse } = require('csv-parse');
const { js2xml } = require('xml-js');
const moment = require('moment');

const inputFile = process.argv[2];
const facturi = [];

// Date furnizor
const FurnizorNume = 'TIPOGRAFIA 3B S.R.L.';
const FurnizorCIF = '16203419';
const FurnizorNrRegCom = 'J40/3451/2004';
const FurnizorCapital = '1700';
const FurnizorTara = 'Romania';
const FurnizorJudet = 'B';
const FurnizorAdresa = 'str. Zamora nr. 1, sector 4';

let dataPrimeiFacturi = '';
let numarulPrimeiFacturi = '';

fs.createReadStream(inputFile)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', function (row) {
        // Ordinea si semnificatia campurilor din CSV
        const [
            ClientCIF,
            FacturaNumar,
            _libraria,
            data,
            valoareMarfa,
            tvaMarfa,
            valoareProduse,
            tvaProduse,
            _baza,
            _totalTva,
            _total,
            ClientNume,
        ] = row;

        const lines = [];

        if (!!valoareMarfa && +valoareMarfa !== 0) {
            const Valoare = Math.round(valoareMarfa * 100) / 100;
            const TVA = Math.round(Math.abs(tvaMarfa) * 100) / 100;
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
                Pret: Math.abs(valoareMarfa), // '136.0000',
                Valoare, // '136.00',
                ProcTVA: '19',
                TVA, // "25.84"
                Cont: '707'
            });
        }
        if (!!valoareProduse && +valoareProduse !== 0) {
            const Valoare = Math.round(valoareProduse * 100) / 100;
            const TVA = Math.round(Math.abs(tvaProduse) * 100) / 100;
            lines.push({
                LinieNrCrt: lines.length + 1,
                Gestiune: [],
                NumeGest: [],
                Descriere: 'PRODUSE',
                CodArticolFurnizor: [],
                CodArticolClient: [],
                CodBare: [],
                InformatiiSuplimentare: [],
                UM: 'Buc',
                Cantitate: Math.sign(valoareProduse), // Poate fi negativa
                Pret: Math.abs(valoareProduse), // '136.0000',
                Valoare, // '136.00',
                ProcTVA: '19',
                TVA, // "25.84"
                Cont: '7015'
            });
        }

        const FacturaData = moment(data, 'M/D/YYYY').format('DD-MM-YYYY');
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
                FacturaScadenta: FacturaData,
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
    })
    .on('end', function () {
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
    })