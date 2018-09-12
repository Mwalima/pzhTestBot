/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

// Requirements for the chatbot 
var restify = require('restify');
var builder = require('botbuilder');
// Requirement for data storage
var botbuilder_azure = require("botbuilder-azure");

// Requirements to access elasticsearch
var es = require('elasticsearch');
var username = 'chatbot';
var password = 'CdUsp65HAX29SRnRhJA6wpWdzWP6UeEK';

var client = new es.Client({
      hosts: [
        'https://'+ 'chatbot' + ':' + 'CdUsp65HAX29SRnRhJA6wpWdzWP6UeEK' + '@51.144.73.77:9200/content'        
      ],
      maxRetries: 2000,
      keepAlive: true,
      maxSockets: 10,
      minSockets: 10,
      ssl: {
        rejectUnauthorized: false
      }
    });


// Setup Restify Server for the chatbot
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () { 
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var inMemoryStorage = new builder.MemoryBotStorage();

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector,
    
        //set the locale here for the bot to give some automatic prompts in Dutch.
        // currently I have set the preferredlocale in every dialog, but there must be a single command to do that.
    function (session, args) {  
        console.log(session.message.text);  
        session.preferredLocale('nl');
        if (typeof session.conversationData.unclear == "undefined"){
            session.conversationData.unclear = [];
        }
        if (session.message.text.split(' ').length < 4){
            session.send('Sorry, ik begrijp u niet. Wellicht kan u de hele zin intypen.');
            session.conversationData.unclear.push(session.message.text);
        } else {
            session.conversationData.unclear.push(session.message.text);  
            session.send('Sorry, ik begrijp niet precies wat u bedoelt. Gelukkig kunt u ook contact opnemen via het formulier van [TopDesk](https://loket.pzh.nl/tas/public/xfg?unid=6f6adaf418c24e318a7c852ca1e66079)');       
        };

	}
);

bot.set('storage', tableStorage);
// bot.set('localizerSettings',{'defaultLocale': "nl"});

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
// var luisAppId = '46aff7bd-d5d3-4956-8c68-8b8e600a67ae';
// var luisAPIKey = '3dc2141961af40b58a7e1bbb75d0118a';
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';
var bingKey = process.env.BING_SPELL_CHECK_API_KEY;
var LuisModeUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/46aff7bd-d5d3-4956-8c68-8b8e600a67ae?subscription-key=3dc2141961af40b58a7e1bbb75d0118a&spellCheck=false&bing-spell-check-subscription-key=61a806bc5c284aba882cfad4e7bda99e&verbose=true&timezoneOffset=0&q=';
//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey + '&spellCheck=true&bing-spell-check-subscription-key=' + bingKey + '&verbose=true&timezoneOffset=0&q=';

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(process.env.LuisModelUrl);
bot.recognizer(recognizer);


// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 

// This welcome message appears as soon as a user opens a chat window to chat with the chatbot.
// bot.on('conversationUpdate', (message) => {
//     if (message.membersAdded) {
//         message.membersAdded.forEach(function (identity) {
//             if (identity.id == message.address.bot.id) {       
//                 var x = Math.floor((Math.random() * 10))%2;
//                 var txt = x==1? 'Hallo! Ik ben Luca.': 'Welkom bij het Dataloket!';      
//                 txt = txt + '\n U kan hier uw zoekopdracht binnen Dataloket starten. Probeer hele maar eenvoudige zinnen te typen. \n Als u hulp nodig heeft, typ dan help voor een keuze menu. \n Ook met een technisch probleem kan ik u snel helpen.';
//                 var reply = new builder.Message()
//                         .address(message.address)
//                         .text(txt);
//                 bot.send(reply);      
//            }
//         });
//     }
// });
bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id == message.address.bot.id) {
             
               var d = new Date();
                var timegreeting = d.getHours();
                
                var morning = 6;
                var afternoon = 12;
                var evening = 18;
                var night = 24;
                var midnight = 0;                
                var greeting;

                if (timegreeting >= morning && timegreeting < afternoon){
                    greeting = "Goedemorgen, ";                   
                    }
                    else if(timegreeting >= afternoon && timegreeting < evening){
                    greeting = "Goedemiddag, ";                  
                    }
                    else if(timegreeting >= evening && timegreeting < night){
                    greeting = "Goedenavond, ";                  
                    }
                    else if(timegreeting == midnight && timegreeting < morning){
                    greeting = "Hallo nachtuil, ";                    
                    }
                    
                    var x = Math.floor((Math.random() * 10)) % 2;
                    txt = x == 1 ? 'Ik ben Luca.' : 'Welkom bij het Dataloket!';
                    txt = txt +'\n U kan hier uw zoekopdracht binnen Dataloket starten. Probeer hele maar eenvoudige zinnen te typen. \n Als u hulp nodig heeft, typ dan help voor een keuze menu. \n Ook met een technisch probleem kan ik u snel helpen.';
                    txt = greeting + txt;
                    
                   var reply = new builder.Message()
                     .address(message.address)
                     .text(txt);
                    bot.send(reply); 
                
        }
        });
    }
});

//message in case of None intent
// bot.dialog('None', 
	
		
// 	).triggerAction({
// 		matches: 'None'
// 	});

// In response to a user saying hi/hallo
bot.dialog('welcomeDialog',
   (session) => {      
        session.preferredLocale('nl');        
        var x = Math.floor((Math.random() * 10))%2;
        var txt = x==1 ? 'Hallo! Ik ben Luca.':'Welkom bij het Dataloket!' ;      
        var reply = new builder.Message()
                .address(session.address)
                .text(txt);    
        session.send(reply);
        session.beginDialog('giveChoices');
    }
    ).triggerAction({
        matches: 'welcome'
});

// In response to 'help', the user is shown the 'giveChoices' dialog
bot.dialog('help', [
    function (session){
        session.preferredLocale('nl');
        session.beginDialog('giveChoices');
    }
]
).triggerAction(
    {matches: /^help$/i}
);


bot.dialog('topDesk', [
   function(session){
       session.preferredLocale('nl');
       if (typeof session.conversationData.problem == "undefined"){
            session.conversationData.problem = [];
        }
       session.conversationData.problem.push(session.message.text);
       session.send('Meld het probleem in [TopDesk](https://loket.pzh.nl/tas/public/xfg?unid=6f6adaf418c24e318a7c852ca1e66079)');
       session.beginDialog('geholpen');
   }
]);

// In response to a user having nieuw verzoek
bot.dialog('verzoek', 
    function(session){
        session.preferredLocale('nl');
        if (typeof session.conversationData.verzoek == "undefined"){
            session.conversationData.verzoek = [];
        }
        session.conversationData.verzoek.push(session.message.text);
        session.send('Meld uw verzoek in [TopDesk](https://loket.pzh.nl/tas/public/xfg?unid=6f6adaf418c24e318a7c852ca1e66079)');
        session.beginDialog('geholpen');
    }).triggerAction(
    {matches: 'nieuw_verzoek'}
);

// In response to the question about uploading a new file 
bot.dialog('dialogUpload', [
   function (session){
       session.preferredLocale('nl');
       session.send('Dat kan onder de knop "bestanden", op de startpagina van het Dataloket.');
       session.beginDialog('geholpen');
   } 
]).triggerAction({
    matches: 'uploaden'
});


bot.dialog('askOnderwerp',[ 
    function(session) {
       session.preferredLocale('nl');
       builder.Prompts.text(session, 'Over welk onderwerp zoekt u informatie? Bijv. energie, water, molen, milieu');             
    },
    function (session, results){
        if (results.response){
            if (typeof session.conversationData.onderwerp == "undefined"){
                session.conversationData.onderwerp = [];
            }
            
            // Save the onderwerp in the converstionData of the session
            session.conversationData.onderwerp.push(results.response);
            session.beginDialog('searchES', results.response);
        }
        }
]);

// What chatbot can do
var choices = ['informatie product/datasets in het Dataloket vinden ', 'veelgestelde vragen over het Dataloket', 'nieuw verzoek indienen', 'technisch probleem melden', 'feedback indienen'];
    
bot.dialog('giveChoices', [
    
    function (session){
        session.preferredLocale('nl');
        builder.Prompts.choice(session, 'Hoe kan ik u helpen?', choices, {listStyle: builder.ListStyle.button });            
    },
    function (session, results, next) { 
        console.log(results);
        if (results.childId == 'BotBuilder:prompt-choice' && results.response.entity == choices[0]){
           session.beginDialog('askOnderwerp');   
        }
        else if (results.childId == 'BotBuilder:prompt-choice' && results.response.entity == choices[1]){
            // ask for the question. Then the question can trigger one of the dialogs, or go in default faulback
           session.send('Wat is uw vraag?'); 
        }
        else if (results.childId == 'BotBuilder:prompt-choice' && results.response.entity == choices[2] ) {
            session.beginDialog('verzoek');            
        } 
        else if (results.childId == 'BotBuilder:prompt-choice' && results.response.entity == choices[3] ){
            session.beginDialog('dialogFout');
        }
        else if (results.childId == 'BotBuilder:prompt-choice' && results.response.entity == choices[4] ){
            //prompt for the text feedback
            builder.Prompts.text(session, 'Ik hoor het graag...');   
            next();
        }
    },
    function (session, results){
        // if the feedback is received, it is saved in the conversation data.
        if (results.childId == 'BotBuilder:prompt-text'){
            if (typeof session.conversationData.feedback == "undefined"){
                session.conversationData.feedback = [];
            }
            console.log(session.message.text);
           session.conversationData.feedback.push(session.message.text);
           session.send('Bedankt voor uw feedback!');
           session.beginDialog('geholpen');
        }
    }   
]).triggerAction({
    matches: 'wat_kan_je_doen'
})
.cancelAction('cancelAction', 'Ok, de vraagstuk geannuleerd.', {
    // The user can cancel his search by typing cancel
    matches: /^laat.*maar$|^annuleren$|^cancel$|^annuleer$|^dag$/i
});

 // Content search dialog triggered when some one searching for content in the dataloket
bot.dialog('content_zoekenDialog',[
    function (session, args) {
        session.preferredLocale('nl');
        console.log('You reached the contentZoeken intent. You said \'%s\'.', session.message.text);
        // Extract the onderwerp or title from the message, depending on how the message was framed. See LUIS.
        var onderwerp = builder.EntityRecognizer.findEntity(args.intent.entities, 'onderwerp');
        var topic = builder.EntityRecognizer.findEntity(args.intent.entities, 'topic');
        console.log('content zoeken dialog -->', args.intent);
        if (typeof session.conversationData.onderwerp == 'undefined'){
            session.conversationData.onderwerp = [];
        };
        
        // If topic / onderwerp identified in the message then jump to the searchES dialog
        if (onderwerp){
            //logging and saving     
            session.conversationData.onderwerp.push(onderwerp.entity);
            session.beginDialog('searchES', onderwerp.entity);       
        } 
        else if (topic){
            //logging and saving     
            session.conversationData.onderwerp.push(topic.entity);
            session.beginDialog('searchES', topic.entity);
        }
        //otherwise ask the user to click on the option what he wants
        else {
            session.beginDialog('askOnderwerp');          
        }       
    }         
]
).triggerAction({
    matches: 'content_zoeken'
})
.cancelAction('cancelAction', 'Ok, dag!', {
    // The user will end the conversation in between if he says 
    matches: /^dag$|^dankjewel$/i
})
.cancelAction('cancelAction', 'Ok, de zoekopdracht geannuleerd.', {
    // The user can cancel his search by typing cancel
    matches: /^laat.*maar$|^annuleren$|^cancel$/i
});

var prodChoices = ['kaart', 'webpagina', 'dataset', 'besluit', 'dashboard', 'alles'];
// Wat voor product type wil je dialog
bot.dialog('watProdType',[
    function (session){
        session.preferredLocale('nl');
        builder.Prompts.choice(session, 'Ok! Welk product wilt u?', prodChoices , {listStyle: builder.ListStyle.button });
       },
    function (session, results){
         if (results){
             session.endDialogWithResult(results);
         }
     }
]).beginDialogAction('dialog_wat_is_prod_type', {matches: 'wat_is_prod_type'});


// The user can interrupt in between to ask the definition of kaart/ dashboard etc.
// Wat is een product type dialog
bot.dialog('dialog_wat_is_prod_type', [
     function (session, args){
         session.preferredLocale('nl');
         var search_item = builder.EntityRecognizer.findEntity(args.intent.entities, 'search_item');
         if (search_item.entity){
         switch (search_item.entity){
             case 'kaart':
                session.endDialog('Een kaart is een gemodelleerde weergave van het aardoppervlak (land en water). Een kaart wordt in toenemende mate digitaal geraadpleegd. Daarbij wordt een samenstel van kaarten (met verschillende lagen, en meer details bij inzoomen) ook wel een kaart genoemd.');
                break;
             case 'rapport':
                session.endDialog('Een rapport is een verslaglegging. Dit verslag wordt, al dan niet na voorafgaand onderzoek door een of meer rapporteur(s) gedaan aan een groep of opdrachtgever. Men kan allerlei verschillende soorten rapporten onderscheiden.');
                break;
             case 'dataset':
                session.endDialog('Dataset is een verzameling van gegevens, vaak in onbewerkte vorm.');
                break;
             case 'besluit':
                session.endDialog('Een besluit is een ..');
                break;
             case 'dashboard':
                session.endDialog('Een dashboard is een verzameling van informatie overzichtelijk weergegeven voor de eindgebruiker.');
                break;          
             default :
                session.endDialog('Sorry, ik begrijp uw vraag niet.');
                break;
         };
         }
     }
 ]).triggerAction(
     {matches: 'wat_is_prod_type',
     onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack 
        // (override the default behavior of replacing the stack and return to the wat_is_uw_prod_type)
        session.beginDialog(args.action, args);
    }
   }
 );

var DATALOKET_WEBSITE = 'https://xe5f95b82989a4b549abc16a-staging.azurewebsites.net/zoeken?query=';
// Here we search in the Elastic search, but first ask the period and type of item
bot.dialog('searchES', [
   function (session, onderwerp){
       session.preferredLocale('nl');
       session.dialogData.onderwerp = onderwerp;
       session.beginDialog('watProdType');
   },
   function (session, results){
       if (results.response){
            // Save the prod type in the dialogData.
           if (results.response.entity == "alles"){
               session.dialogData.prodType = "alles";
           } 
           else session.dialogData.prodType = results.response.entity;
           builder.Prompts.choice(session, 'Ik ga voor u zoeken. In welke periode zal ik voor u zoeken?', ['afgelopen half jaar', 'afgelopen jaar', 'afgelopen 5 jaar', 'alles'], {listStyle: builder.ListStyle.button } );           
       }
   },
   function (session, results){
       if (results){
           session.dialogData.period = results.response.entity;
           console.log(results.response.entity);
           switch(session.dialogData.period){
               case "afgelopen half jaar":
                    var period = 'now-6m/m';
                    break;
               case "afgelopen jaar":
                    var period = 'now-1y/y';
                    break;
               case "afgelopen 5 jaar":
                    var period = 'now-5y/y';
                    break;
               default:
                    var period = 'alles';
                    break;            
           }
                   
           console.log('zoeken ',  session.dialogData.onderwerp);
           session.send('Ik ga voor u zoeken '); 
           // 'Wilt u meer resultaten zien, zet dan uw zoekopdracht in het Dataloket.'
           // Wait for the response from the elasticsearch api and then frame the response message
           // TO DO: time out for the wait and a sorry message.
           esQuerySearch(session.dialogData.onderwerp, session.dialogData.prodType, period, body => {
                var hits = body.hits.total;
                if (hits != 1 ){
                     session.send('Ik heb ' + hits + ' resultaten over ' + session.dialogData.onderwerp + ' in het Dataloket gevonden.');                
                } else {
                     session.send('Ik heb ' + hits + ' resultaat over ' + session.dialogData.onderwerp + ' in het Dataloket gevonden.');                
                }
                console.log(hits);
                if (hits>0){

                    var msg = 'De resultaten zijn : \n';
                    var array = body.hits.hits.slice(0,Math.min(10, hits));
                    array.forEach(function(element){
                        msg = msg + '[' + element._source.title + '](' + element._source.path + ') ' + element._source.createDate + '\n\n';
                    });
					/*msg = msg + '[meer resultaten...](' + DATALOKET_WEBSITE + session.dialogData.onderwerp.replace(reg, "%20") + '&offset=1';
					// find all the spaces using regexp and replace with %20;
					var reg = /\s/g; 
					switch (prodType){
						case 'kaart' : 
							msg = msg + '&contentTypeName=${session.dialogData.prodType.replace(/^\w/, c => c.toUpperCase())}';
							break;
						case 'webpagina':
							msg = msg + '&contentTypeName=${session.dialogData.prodType.replace(/^\w/, c => c.toUpperCase())}';
							break;
					};
					switch (period){
						case 'afgelopen jaar':
							msg = msg + '&date=thisyear';
							break;
					} 
					msg = msg + ')';
					*/
					if (hits >10){
						msg = msg + '\n Wilt u meer resultaten zien, zet dan uw zoekopdracht in het Dataloket.';
					}
                    session.send(msg);

                    session.beginDialog('geholpen');  
               } else {
                    builder.Prompts.choice(session, 'Wilt u een andere zoekterm proberen?', ['ja', 'nee'], {listStyle: builder.ListStyle.button });
                    
               }
            });                   
        } 
    }, 
    function(session, results){
        if (results.response.entity == 'ja'){
            session.beginDialog('askOnderwerp');
        } else if (results.response.entity == 'nee'){
            builder.Prompts.choice(session, 'Kan ik u op een andere manier helpen?', ['ja', 'nee'],  {listStyle: builder.ListStyle.button });
        }
    },
    function (session, results){
        if (results.response.entity == 'ja'){
            session.beginDialog('giveChoices');
        } else if (results.response.entity == 'nee'){
            session.send('Tot de volgende keer.');
        }
    }
])
.cancelAction('cancelAction', 'Ok, de zoekopdracht geannuleerd.', {
    // The user can cancel his search by typing cancel
    matches: /^laat.*maar$|^annuleren$|^cancel$/i
});

// Frame and send a query to elasticsearch
// Refer: https://github.com/sudo-suhas/elastic-builder
function esQuerySearch(onderwerp, prodType, period, callback){
    console.log(onderwerp);
    console.log(prodType);
    var query_body = {
              
                  "query": {
                    "bool": {
                      "should": [
                        {
                          "multi_match": {
                            "query": onderwerp,
                            "type": "best_fields",
                            "fields": [
                              "title^3",
                              "description",
                              "categoryTypeName^2",
                              "tags"
                            ]
                          }
                        },
                        {
                          "multi_match": {
                            "query": onderwerp,
                            "type": "cross_fields",
                            "fields": [
                              "title^3",
                              "description",
                              "categoryTypeName^2",
                              "tags"
                            ],
                            "boost": 0.8
                          }
                        },
                        {
                          "multi_match": {
                            "query": onderwerp,
                            "fuzziness": "1",
                            "prefix_length": "3",
                            "fields": [
                              "title^3",
                              "description",
                              "categoryTypeName^2",
                              "tags"
                            ],
                            "boost": 0.3
                          }
                        }
                      ],
                      "filter": {
                        "term": {
                          "active": true, 
                          
                        }
                      },
                      "minimum_should_match": 1
                    }
                  },
                  "size": 5000 
          } ;
    
    if (period != "alles"){
        if (prodType != "alles"){
            query_body.query.bool.filter = [{"term":{"active":true}}, {"term": {"contentTypeName": prodType}}];
            query_body.query.bool.must_not = {"range":{"createDate":{"lt":period}}};
        }
        else {
            query_body.query.bool.must_not = {"range":{"createDate":{"lt":period}}};
        }       
    }
    else {
        if (prodType != "alles"){
            query_body.query.bool.filter = [{"term":{"active":true}}, {"term": {"contentTypeName": prodType}}];
        }
        else { 
            query_body = query_body;
        }     
    }

    // send the framed query to the es client. Retrieve only tile, path and createDat of the resutls.
    client.search({
          _source: ['title', 'path', 'createDate', 'contentTypeName'],
          body: query_body
      }).then( function (body){     
          // console.log(body.hits.hits);
          callback(body);
          
      }, function (error){
          console.trace(error.message);
        }
    );
};

// not being used
function esQueryCount(onderwerp,callback){  
    client.count({
      q: onderwerp
    }).then( function (body) {
      var hits = body.count;   
      callback(hits);
    }).catch(function (error) {
      console.trace(error.message);
    });
};


// Finishing block. Send at the end of all the dialogs
bot.dialog('geholpen', [
    function (session){
        
        builder.Prompts.choice(session, 'Heb ik u geholpen?', ['ja', 'nee'], {listStyle: builder.ListStyle.button });
    },
    function (session, results){
        if (results.response.entity == 'ja'){
            builder.Prompts.choice(session, 'OK! Kan ik u verder helpen?', ['ja', 'nee'],{listStyle: builder.ListStyle.button });
        }
        else if (results.response.entity == 'nee'){
            session.send('Wat jammer dat ik u op dit moment niet kan helpen. Gelukkig kunt u ook contact opnemen via het formulier van [TopDesk](https://loket.pzh.nl/tas/public/xfg?unid=6f6adaf418c24e318a7c852ca1e66079). Of stuur een bericht naar: dataloket@pzh.nl');
        }
    }, 
    function (session,results){
        if (results.response.entity == 'ja'){
            session.beginDialog('giveChoices');
        }
        else if (results.response.entity == 'nee'){
            session.send('Tot de volgende keer.');
        }
    }
]);

// Fout melden
bot.dialog('dialogFout', [
    function(session){
        session.preferredLocale('nl');
        session.beginDialog('topDesk');  
    }
]).triggerAction(
    {matches: 'fout_melden'}
);



// Spell Check
// var spellService = require('./spell-service');
// if (process.env.IS_SPELL_CORRECTION_ENABLED == 'true' ) {
//     bot.use({
//         botbuilder: function (session, next) {
//             spellService
//                 .getCorrectedText(session.message.text)
//                 .then(function (correctedtext) {
//                     console.log('Text corrected to "' + correctedtext + '"');
//                     session.message.text = correctedtext;
//                     next();
//                 })
//                 .catch(function (error) {
//                     console.error(error);
//                     next();
//                 });
//         }
//     });
// }




