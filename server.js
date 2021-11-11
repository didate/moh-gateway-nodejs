const express = require('express');
const Vonage = require('@vonage/server-sdk');
const config = require('config');
const cron = require("node-cron");


const {
    query
} = require('./query');

const app = express();
const port = 3000;

const sendername = config.get('vonage.sendername');


app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/send-sms', (req, res) => {

    const vonage = new Vonage({
        apiKey: config.get('vonage.apiKey'),
        apiSecret: config.get('vonage.secret')
    });

    console.log(req.query);
    const API = req.query.smsapikey;
    const TO = req.query.to;
    const MESSAGE = req.query.content;
    const FROM = sendername;

    if (API === config.get('smsgatewaykey')) {

      vonage.message.sendSms(FROM, TO, MESSAGE, { type: 'unicode' }, (err, responseData) => {
        if (err) {
          console.log(`Error : ${err}`);
        } else {
          if (responseData.messages[0]['status'] !== "0") {
            console.log(`Error : Message failed with error: ${responseData.messages[0]['error-text']}`);
          }
        }
      });
    }
    res.send('Send SMS Gateway!')
});

app.listen(port, () => {
    console.log(`Application exemple à l'écoute sur le port ${port}!`)
});



callback = (error, response) => {
    if (error) {
        console.error("NOT OK")
    }

    if (response) {
        console.log("OK")
    }
}

function isCorrectPhone(telephone) {
    if (!telephone && telephone.length !== 9 && telephone.substring(0, 2) !== '62' && telephone.substring(0, 2) !== '65' && telephone.substring(0, 2) !== '66') return false;
    return true;
}



const processing = async (event) => {
    const vonage = new Vonage({
        apiKey: config.get('vonage.apiKey'),
        apiSecret: config.get('vonage.secret')
    });

    event.telephoneResponsable = event.telephoneResponsable.replace(/\s+/g, "");
    try {

        if (isCorrectPhone(event.telephoneResponsable)) {
            event.telephoneResponsable = `00224${event.telephoneResponsable}`;
            const content = `Bonjour Mme Mr\nVotre enfant ${event.nomEnfant} ${event.prenomEnfant} enregistre sous la reference ${event.localid} doit etre vaccine le ${event.dateRdv}.\nMerci de vous rendre au centre de sante avec son carnet.`
            console.log(sendername, event.telephoneResponsable, content);
            vonage.message.sendSms(sendername, event.telephoneResponsable, content,  (err, res)=>{
                if(err){
                    console.log(err)
                }else{
                    if(res.messages[0]['status'] === "0") {
                        console.log("Message sent successfully.");
                    } else {
                        console.log(`Message failed with error: ${res.messages[0]['error-text']}`);
                    }
                }
            });

        }
    } catch (error) {
        console.log(error);
    }
}


cron.schedule("0 0 18 * * *", async () => {
    query().then(async (datas) => {
        for (let index = 0; index < datas.length; index++) {
            const element = datas[index];
            await processing(element);
        }
    })
})