/** **********************
node index.js ./input.csv 
************************** */

const fs = require('fs');
const { parse } = require('csv-parse');
const { js2xml } = require('xml-js');

const inputFile = process.argv[2];
const facturi = [];

fs.createReadStream(inputFile)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', function (row) {
        // Ordinea si semnificatia campurilor din CSV
        const [
            ClientCIF,
            FacturaNumar,
            _libraria,
            FacturaData,
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
            const Valoare = Math.round(Math.abs(+valoareMarfa) * 100) / 100;
            const TVA = Math.round(Math.abs(+tvaMarfa) * 100) / 100;
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
                Cantitate: !!valoareMarfa && +valoareMarfa >= 0 ? 1 : -1, // Poate fi negativa
                Pret: Math.abs(+valoareMarfa), // '136.0000',
                Valoare, // '136.00',
                ProcTVA: '19',
                TVA, // "25.84"
                Cont: '707'
            });
        }
        if (!!valoareProduse && +valoareProduse !== 0) {
            const Valoare = Math.round(Math.abs(+valoareProduse) * 100) / 100;
            const TVA = Math.round(Math.abs(+tvaProduse) * 100) / 100;
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
                Cantitate: !!valoareProduse && +valoareProduse >= 0 ? 1 : -1, // Poate fi negativa
                Pret: Math.abs(+valoareProduse), // '136.0000',
                Valoare, // '136.00',
                ProcTVA: '19',
                TVA, // "25.84"
                Cont: '7015'
            });
        }

        const factura = {
            Antet: {
                FurnizorNume: 'Cribo Grup SRL',
                FurnizorCIF: 'RO15438697',
                FurnizorNrRegCom: 'J40/6575/2003',
                FurnizorCapital: '15000 LEI',
                FurnizorTara: 'Romania',
                FurnizorLocalitate: 'Romania',
                FurnizorJudet: 'B',
                FurnizorAdresa: 'str. Belizarie, nr. 23, Bl. 3/3, sc. A, et. 1, ap. 5, Sector 1',
                FurnizorTelefon: '+40 722 707 707',
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
        fs.writeFile('./output.xml', xml, (err) => {
            if (err) return console.log(err);
            console.log('File successfully processed!!!');
        });
    })