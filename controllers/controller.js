'use strict';

const common = require("../controllers/common");
const logger = require("./../logger");
const config = require("./../config");

const traversal=require("../controllers/traversal");

let sessionId = null;

exports.get_request = function (req, res) {
    res.send('This is NodeJs app, which contains the webhook code for Google Dialogflow bot. Use this url in fullfilment section of Dialogflow');
    logger.log('info',"get_request()> Res to user= This is NodeJs app, which contains the webhook code for Google Dialogflow bot. Use this url in fullfilment section of Dialogflow");
}


/** 
 * For V2 webhook response format please ref. https://dialogflow.com/docs/reference/v1-v2-migration-guide-fulfillment#webhook_responses
 */
exports.dialogflow_webhook_request = function (req, res) {
    let responseJson = {};
    try{
        sessionId= common.getSessionId(req.body.queryResult.outputContexts);

        logger.log('debug',"dialogflow_webhook_request()> req= " + JSON.stringify(req.body), {logId: sessionId});
        
        let intent = req.body.queryResult.intent;
        logger.log('info',"dialogflow_webhook_request()> intent= " + intent.displayName, {logId: sessionId});

        let queryText = req.body.queryResult.queryText;
        logger.log('info',"dialogflow_webhook_request()> queryText= " + JSON.stringify(queryText), {logId: sessionId});
        
        //logger.log('debug',"dialogflow_webhook_request()> queryResult= " + JSON.stringify(req.body.queryResult), {logId: sessionId});
        
        let action = req.body.queryResult.action; 
        logger.log('info',"dialogflow_webhook_request()> action= " + action, {logId: sessionId});
        
        //let parameters = req.body.queryResult.parameters;
        //logger.log('info',"dialogflow_webhook_request()> parameters= " + JSON.stringify(parameters), {logId: sessionId});
        
        let outputContexts = req.body.queryResult.outputContexts;
        let session_vars = common.GetSessionVarsFromOutputContext(outputContexts,sessionId);
        logger.log('info',"dialogflow_webhook_request()> session_vars= " + JSON.stringify(session_vars), {logId: sessionId});

        responseJson.fulfillmentText = 'Error in Nodejs code';
        if(action === 'sendOtp'){
            logger.log('info',req, {logId: sessionId});
            sendOtp (res, outputContexts,sessionId,req.body)
        }else if(action === 'resetPassword'){ 
            resetPassword (res, outputContexts,sessionId,req.body)
        }else if(action === 'confirmEmpIdFallback'){ 
            confirmEmpIdFallback (res, outputContexts,sessionId,req.body)
        }else if(action === 'resetNoOfTries'){ 
            resetNoOfTries (res, outputContexts,sessionId,req.body)
        }else{
            //add warning message
            responseJson.fulfillmentText = 'Invalid choice, unable to process your request';  
            //sessionId|action|intent|querytext|fulfillment|contextString
            //traversal.nodeTraversal(sessionId+'|'+action+'|'+intent.displayName+'|'+queryText+'|'+responseJson.fulfillmentText+'|'+contextStr);          
            logger.log('info',"dialogflow_webhook_request-noMatch()> responseJson= " + JSON.stringify(responseJson), {logId: sessionId});                               
            res.json(responseJson); 
        }
    }
    catch(e){
        logger.log('error', e.stack, { logId: sessionId});
    } 
}



/**
 * Reset 'sendOtp' value to 0 and update in 'session_vars' 
 * Blank fulfillment text will ensure that Dialogflow will use the response from Intent
 */
function sendOtp (responseToUser, outputContexts,sessionId,queryResult) {
    let responseJson = {};
    let fulfillmentMessages =null;
    let contextStr = null; 
    try{
        // let noOfTries = common.GetParameterValueFromSessionVars('noOfTries', outputContexts, sessionId)         
        // logger.log('info','resetNoOfTries()> Existing noOfTries= '+ noOfTries, {logId: sessionId});
        let noOfTries = 0;
        logger.log('info','sendOtp()> noOfTries reset to = '+ noOfTries, {logId: sessionId});
        let session_vars = 'projects/'+common.getProjectId(outputContexts, sessionId)+'/agent/sessions/'+ sessionId +'/contexts/session_vars';
        
        contextStr = '[{"name":"' + session_vars + '", "lifespanCount":100, "parameters":{"noOfTries":'+ noOfTries +'}}]';
        
        //We are resetting the 'noOfTries' variable value only
        //Blank fulfillment text will ensure that Dialogflow will use the response from Intent
        responseJson.fulfillmentText = "";        
        logger.log('info','sendOtp()> contextStr= '+ contextStr, {logId: sessionId});
        
        var axios = require('axios');
        var smsMobileNumber=config.sms.mobileNumber;
        var smsOtp=config.sms.otp;
        var smsUsername=config.sms.username;
        var smsPassword=config.sms.password;
        var smsSource=config.sms.source;
        var smsConfig = {
        method: 'get',
        url: 'http://sms.digimiles.in/bulksms/bulksms?username='+smsUsername+'&password='+smsPassword+'&type=0&dlr=1&destination='+smsMobileNumber+'&source='+smsSource+'&message='+smsOtp,
        headers: { }
        };

        axios(smsConfig)
        .then(function (response) {
            logger.log('info','sendOtp()> send sms response: '+JSON.stringify(response.data), {logId: sessionId});
        })
        .catch(function (error) {
        console.log(error);
        });

        //sessionId|action|intent|input|fulfillment|contextString
       // traversal.nodeTraversal(sessionId,queryResult,'success',responseJson.fulfillmentText,contextStr);
        responseJson.outputContexts = JSON.parse(contextStr);
    }catch(e){
        actionStatus='error';
        logger.log('error', e.stack, { logId: sessionId});
    }  
    traversal.nodeTraversal(sessionId,queryResult,fulfillmentMessages,contextStr,''); 
    logger.log('info','sendOtp()> Response:'+JSON.stringify(responseJson), {logId: sessionId});
    responseToUser.json(responseJson);
}

/**
 * Reset 'resetPassword' value to 0 and update in 'session_vars' 
 * Blank fulfillment text will ensure that Dialogflow will use the response from Intent
 */
function resetPassword (responseToUser, outputContexts,sessionId,queryResult) {
    let responseJson = {};
    let fulfillmentMessages =null;
    let contextStr = null; 
    try{
        // let noOfTries = common.GetParameterValueFromSessionVars('noOfTries', outputContexts, sessionId)         
        // logger.log('info','resetNoOfTries()> Existing noOfTries= '+ noOfTries, {logId: sessionId});
        let noOfTries = 0;
        logger.log('info','resetPassword()> noOfTries reset to = '+ noOfTries, {logId: sessionId});
        let session_vars = 'projects/'+common.getProjectId(outputContexts, sessionId)+'/agent/sessions/'+ sessionId +'/contexts/session_vars';
        
        contextStr = '[{"name":"' + session_vars + '", "lifespanCount":100, "parameters":{"noOfTries":'+ noOfTries +'}}]';
        
        //We are resetting the 'noOfTries' variable value only
        //Blank fulfillment text will ensure that Dialogflow will use the response from Intent
        responseJson.fulfillmentText = "";        
        logger.log('info','resetPassword()> contextStr= '+ contextStr, {logId: sessionId});
        
        var axios = require('axios');
        var smsMobileNumber=config.sms.mobileNumber;
        var smsPasswordReset=config.sms.passwordResetSms;
        var smsUsername=config.sms.username;
        var smsPassword=config.sms.password;
        var smsSource=config.sms.source;
        var smsConfig = {
        method: 'get',
        url: 'http://sms.digimiles.in/bulksms/bulksms?username='+smsUsername+'&password='+smsPassword+'&type=0&dlr=1&destination='+smsMobileNumber+'&source='+smsSource+'&message='+smsPasswordReset,
        headers: { }
        };

        axios(smsConfig)
        .then(function (response) {
            logger.log('info','resetPassword()> send sms response = '+JSON.stringify(response.data), {logId: sessionId});
        })
        .catch(function (error) {
        console.log(error);
        });

        //sessionId|action|intent|input|fulfillment|contextString
       // traversal.nodeTraversal(sessionId,queryResult,'success',responseJson.fulfillmentText,contextStr);
        responseJson.outputContexts = JSON.parse(contextStr);
    }catch(e){
        actionStatus='error';
        logger.log('error', e.stack, { logId: sessionId});
    }  
    traversal.nodeTraversal(sessionId,queryResult,fulfillmentMessages,contextStr,''); 
    logger.log('info','resetPassword()> Response:'+JSON.stringify(responseJson), {logId: sessionId});
    responseToUser.json(responseJson);
}


/**
 * Reset 'confirmEmpIdFallback' value to 0 and update in 'session_vars' 
 * Blank fulfillment text will ensure that Dialogflow will use the response from Intent
 */
function confirmEmpIdFallback (responseToUser, outputContexts,sessionId,queryResult) {
    let responseJson = {};
    let fulfillmentMessages =null;
    let contextStr = null; 
    try{
        console.log(queryResult)
        // let noOfTries = common.GetParameterValueFromSessionVars('noOfTries', outputContexts, sessionId)         
        // logger.log('info','resetNoOfTries()> Existing noOfTries= '+ noOfTries, {logId: sessionId});
        let noOfTries = 0;
        logger.log('info','confirmEmpIdFallback()> noOfTries reset to = '+ noOfTries, {logId: sessionId});
        let session_vars = 'projects/'+common.getProjectId(outputContexts, sessionId)+'/agent/sessions/'+ sessionId +'/contexts/session_vars';
        
        contextStr = '[{"name":"' + session_vars + '", "lifespanCount":100, "parameters":{"noOfTries":'+ noOfTries +'}}]';
        
        //We are resetting the 'noOfTries' variable value only
        //Blank fulfillment text will ensure that Dialogflow will use the response from Intent
        //fulfillmentMessages='[{"text": {"text": ["'+ text +'"]},"platform": "VIBER"},{"text": {"text": ["'+ text +'"]},"platform": "FACEBOOK"}] ';    
        var outputCxt=common.GetSessionVarsFromOutputContext(outputContexts,sessionId);
        console.log(outputCxt)
        var empId=outputCxt['number-integer.original'];
        console.log(empId)
        //responseJson.fulfillmentText ="Sorry I didn't get that. Please confirm your employee ID " +empId+ " : yes/no";
         logger.log('info','confirmEmpIdFallback()> contextStr= '+ contextStr, {logId: sessionId});
        var text="Sorry I didn't get that. Please confirm your employee ID " +empId+ " : yes/no";
        var ssml="<speak>Sorry I didn't get that. I am going to unlock the account  with employee I.D.<say-as interpret-as=\"digits\">  " +empId+ " </say-as><break time=\"0.5s\"/> Please confirm</speak>"
        fulfillmentMessages=[
            {
              "text": {
                "text": [
                  text
                ]
              },
              "platform": "FACEBOOK"
            },
            {
              "platform": "ACTIONS_ON_GOOGLE",
              "simpleResponses": {
                "simpleResponses": [
                  {
                    "textToSpeech": text
                  }
                ]
              }
            },
            {
              "platform": "TELEPHONY",
              "telephonySynthesizeSpeech": {
                "ssml": ssml
              }
            },
            {
              "text": {
                "text": [
                    text
                ]
              }
            }
          ];
          responseJson.fulfillmentMessages=fulfillmentMessages
        //sessionId|action|intent|input|fulfillment|contextString
       // traversal.nodeTraversal(sessionId,queryResult,'success',responseJson.fulfillmentText,contextStr);
        responseJson.outputContexts = JSON.parse(contextStr);
    }catch(e){
        actionStatus='error';
        logger.log('error', e.stack, { logId: sessionId});
    }  
    traversal.nodeTraversal(sessionId,queryResult,fulfillmentMessages,contextStr,''); 
    logger.log('info','confirmEmpIdFallback()> Response:'+JSON.stringify(responseJson), {logId: sessionId});
    responseToUser.json(responseJson);
}


/**
 * Reset 'noOfTries' value to 0 and update in 'session_vars' 
 * Blank fulfillment text will ensure that Dialogflow will use the response from Intent
 */
function resetNoOfTries (responseToUser, outputContexts,sessionId,queryResult) {
    let responseJson = {};
    let fulfillmentMessages =null;
    let contextStr = null; 
    try{
        // let noOfTries = common.GetParameterValueFromSessionVars('noOfTries', outputContexts, sessionId)         
        // logger.log('info','resetNoOfTries()> Existing noOfTries= '+ noOfTries, {logId: sessionId});
        let noOfTries = 0;
        logger.log('info','resetNoOfTries()> noOfTries reset to = '+ noOfTries, {logId: sessionId});
        let session_vars = 'projects/'+common.getProjectId(outputContexts, sessionId)+'/agent/sessions/'+ sessionId +'/contexts/session_vars';
        
        contextStr = '[{"name":"' + session_vars + '", "lifespanCount":100, "parameters":{"noOfTries":'+ noOfTries +'}}]';
        
        //We are resetting the 'noOfTries' variable value only
        //Blank fulfillment text will ensure that Dialogflow will use the response from Intent
        responseJson.fulfillmentText = "";        
        logger.log('info','resetNoOfTries()> contextStr= '+ contextStr, {logId: sessionId});
        
        //sessionId|action|intent|input|fulfillment|contextString
       // traversal.nodeTraversal(sessionId,queryResult,'success',responseJson.fulfillmentText,contextStr);
        responseJson.outputContexts = JSON.parse(contextStr);
    }catch(e){
        actionStatus='error';
        logger.log('error', e.stack, { logId: sessionId});
    }  
    traversal.nodeTraversal(sessionId,queryResult,fulfillmentMessages,contextStr,''); 
    logger.log('info','resetNoOfTries()> Response:'+JSON.stringify(responseJson), {logId: sessionId});
    responseToUser.json(responseJson);
}
