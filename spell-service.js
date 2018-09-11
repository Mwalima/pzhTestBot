// The exported functions in this module makes a call to Bing Spell Check API that returns spelling corrections.

// For more info, check out the API reference:

// https://dev.cognitive.microsoft.com/docs/services/56e73033cf5ff80c2008c679/operations/56e73036cf5ff81048ee6727

// var request = require('request');

'use strict';

var https = require ('https');

var SPELL_CHECK_API_URL = process.env.BING_SPELL_CHECK_API_ENDPOINT;

var SPELL_CHECK_API_KEY = '61a806bc5c284aba882cfad4e7bda99e';

var host = 'api.cognitive.microsoft.com';
var path = '/bing/v7.0/spellcheck';

/**

 * Gets the correct spelling for the given text

 * @param {string} text The text to be corrected

 * @returns {Promise} Promise with corrected text if succeeded, error otherwise.

 */
var mkt = "nl-NL";
var mode = "spell";

var query_string = "?mkt=" + mkt + "&mode=" + mode;

exports.getCorrectedText = function (text) {

    return new Promise(

        function (resolve, reject) {

            if (text) {

                var requestParams = {

                    method : 'POST',
                    hostname : host,
                    path : path + query_string,

                    headers: {
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Content-Length' : text.length,
                        "Ocp-Apim-Subscription-Key": SPELL_CHECK_API_KEY
                    },
                    
                        parameter: {
                            text: text
                        }

                };
                var response_handler = function (response) {
                var body = '';
                response.on ('data', function (d) {
                    body += d;
                    // resolve(body);
                });
                response.on ('end', function () {
                    resolve(body);
                    console.log (body);
                });
                response.on ('error', function (e) {
                    console.log ('Error: ' + e.message);
                });
            };

                
               
                var req = https.request (requestParams, response_handler, response_handler);
                req.write ("text=" + text);
                req.end();

            } 

        }

    );

};