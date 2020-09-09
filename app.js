const express = require('express');
const bodyParser = require('body-parser');
const logger = require("./logger");

const config = require('./config');
const route = require('./routes/route'); // Imports routes for the users

const PORT = config.server.port;
const SERVER_TIMEOUT_MS = config.server.timeoutMs;
const USE_SSL = config.server.usessl;
const SMULATION_MODE = config.simulationMode;
const TRAVERSAL = config.traversal;

logger.log('info', 'app.js()> USE_SSL= ' + USE_SSL);
logger.log('info', 'app.js()> SMULATION_MODE= ' + SMULATION_MODE);
logger.log('info', 'app.js()> TRAVERSAL= ' + TRAVERSAL);

if(USE_SSL == 'off'){
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use('/HelpdeskWebhook', route);
    app.get('/', (req, res) => res.send('This is NodeJs app, which contains the webhook code for Google Dialogflow bot'))
    app.listen(PORT, () => {
        logger.log('info', "################## listening on port " + PORT + ". SERVER_TIMEOUT_MS= " + SERVER_TIMEOUT_MS + " ##################", { logId: "NULL" });
        logger.log('info', "################## "+app.name+" listening to "+app.url+" ##################", { logId: "NULL" });
    });
}else{
    let fs = require('fs');
    let path = require('path')
    var https_options = {   
        key: fs.readFileSync(path.join(__dirname, 'ssl_cert/agcdaindia_pvt.key')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl_cert/agcdaindia_com.crt')),
        ca: [
          fs.readFileSync(path.join(__dirname, 'ssl_cert/AAACertificateServices.crt')),
          fs.readFileSync(path.join(__dirname, 'ssl_cert/USERTrustRSAAAACA.crt')),
          // fs.readFileSync(path.join(__dirname, 'ssl_cert/CA_bundle.crt')),
          // fs.readFileSync(path.join(__dirname, 'ssl_cert/SectigoRSADomainValidationSecureServerCA.crt'))
        ]
    };  
    let app = express() , server = require('https').createServer(https_options, app);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use('/HelpdeskWebhook', route);
    server.setTimeout(SERVER_TIMEOUT_MS);
    
    app.get('/', (req, res) => res.send('This is NodeJs app, which contains the webhook code for Google Dialogflow bot'))
    server.listen(PORT, () => {
        logger.log('info', "################## listening on port " + PORT + ". SERVER_TIMEOUT_MS= " + SERVER_TIMEOUT_MS + " ##################", { logId: "NULL" });
        logger.log('info', "################## "+app.name+" listening to "+app.url+" ##################", { logId: "NULL" });
    });
}


    