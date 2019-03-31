// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


//I used axios http client because it suppports Promises. 
const axios = require("axios");

import { ActivityTypes, TurnContext } from 'botbuilder';
import { resolve } from 'url';

export class MyBot {
    /**
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} context on turn context object.
     */
    public onTurn = async (turnContext: TurnContext) => {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {            
            //See if '!ddg' (command) is in front of string
            if(turnContext.activity.text.substr(0, 4) == "!ddg") {
                //Extract query string (string after '!ddg' command)
                let queryString : string = turnContext.activity.text.substr(5, turnContext.activity.text.length)
                await turnContext.sendActivity(`You want to know about '${ queryString }'? Let me ask Duck Duck Go about that...`);
                //Provide endpoint for DDG API
                let endpoint : string = `https://api.duckduckgo.com/?q=${ queryString }&format=json`;
                try {
                    //Send HTTP GET Request to DDG API, waits for response.
                    const response = await axios.get(endpoint);
                    //If There is an 'AbstractText' value in the response.
                    if(response.data.AbstractText) {
                        await turnContext.sendActivity(`DDG tells me that ${ response.data.AbstractText }`);
                    } else {
                        //If no AbstractText, see if there are any Related Topics.
                        if(response.data.RelatedTopics[0].Result) {
                            //Remove anchor element that begins with every related topic value
                            let parsedResult = response.data.RelatedTopics[0].Result.replace(/<a.+>/,"");
                            await turnContext.sendActivity(`DDG tells me that in regards to ${ queryString }, '${ parsedResult }' `);
                        } else {
                            await turnContext.sendActivity(`I'm sorry, I didn't get an answer from DDG regarding '${ queryString }'.`);
                        }
                    }
                } catch(error) {
                    await turnContext.sendActivity(`I'm sorry, I didn't get an answer from DDG regarding '${ queryString }'.`);
                }
            } else {
                await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
            }
        } else {
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }   
}
