const axios = require('axios');
const config = require('config');

const TOKEN = config.get('dhis2token');
const headers = {
    Authorization: `Basic ${TOKEN}`
};
const uri = config.get('dhis2url');
const size = 200;

let data = [];


const query = async () => {

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let rdv = `${tomorrow.getFullYear()}-${tomorrow.getMonth()+1}-${tomorrow.getDate()}`;
    data = []
    const rdvDataElements = ['V6AbrEH09CE','VmyTzeLPT8z','cwfj1Ubuon4','Bnvjaea4Bq9','l7fYnoSokUv'];
    for (let index = 0; index < rdvDataElements.length; index++) {
        const element = rdvDataElements[index];
        const response = await axios.get(`${uri}/api/29/analytics/events/query/DgZNKSYLbUK.json?dimension=pe:THIS_YEAR;LAST_YEAR,ou:Ky2CzFdfBuO,X6tfotxYRPH.lAOm8euor7H,X6tfotxYRPH.bbOBxG4F6ja,X6tfotxYRPH.bXEwbxbLR9a,X6tfotxYRPH.vNM1jhFay2S,X6tfotxYRPH.Nw4lAR9nGqS,X6tfotxYRPH.o4G6QCnC4ZN,X6tfotxYRPH.${element}:EQ:${rdv}&stage=X6tfotxYRPH&displayProperty=NAME&outputType=EVENT&desc=eventdate&pageSize=${size}&page=1`, {
            headers: headers
        });
    
        makeData(response.data.rows);
        const pager = {
            page,
            total,
            pageSize,
            pageCount
        } = response.data.metaData.pager
    
        if (pager.pageCount > 0) {
            for (let index = 2; index <= pager.pageCount; index++) {
                page = index;
                const response = await axios.get(`${uri}/api/29/analytics/events/query/DgZNKSYLbUK.json?dimension=pe:THIS_YEAR;LAST_YEAR,ou:Ky2CzFdfBuO,X6tfotxYRPH.lAOm8euor7H,X6tfotxYRPH.bbOBxG4F6ja,X6tfotxYRPH.bXEwbxbLR9a,X6tfotxYRPH.vNM1jhFay2S,X6tfotxYRPH.Nw4lAR9nGqS,X6tfotxYRPH.o4G6QCnC4ZN,X6tfotxYRPH.${element}:EQ:${rdv}&stage=X6tfotxYRPH&displayProperty=NAME&outputType=EVENT&desc=eventdate&pageSize=${size}&page=${page}`, {
                    headers: headers
                });
                makeData(response.data.rows);
            }
        }
    }
    
    return data;
}

function makeData(rows) {
    
    rows.forEach(element => {
        const rdv = new Date(element[19].substring(0,10));
        const event = {
            responsable: element[13],
            nomEnfant: element[14],
            prenomEnfant: element[15],
            telephoneResponsable: element[16],
            langue: element[17],
            localid: element[18],
            dateRdv: `${rdv.getDate()}-${rdv.getMonth()+1}-${rdv.getFullYear()}`
        }
        data.push(event);
    });
}

module.exports = {
    query
}