const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const { MessageEmbed } = require('discord.js');
const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const axios = require("axios");


const TOKEN_PATH = 'token.json';
const CREDETIALS_PATH = 'credentials.json';

async function refreshAccessToken(refreshToken, clientID, clientSecret){

    const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
    })

    const accessToken = response.data.access_token;
    const expiryDate = response.data.expiry_date;

    let content = JSON.parse(fs.readFileSync(TOKEN_PATH));
    content.access_token = accessToken;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(content));

    content = JSON.parse(fs.readFileSync(TOKEN_PATH));
    content.expiry_date = expiryDate;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(content));
}

function getNewAccessToken(){
    fs.readFile(CREDETIALS_PATH, (err, content) => {
        if(err) return console.log(err);
        const {client_id, client_secret} = JSON.parse(content).installed
        fs.readFile(TOKEN_PATH, (err, content) => {
            if (err) return console.log(err);
            const token = JSON.parse(content).refresh_token;
            return refreshAccessToken(token, client_id, client_secret);            
        })
    })
}

module.exports = {
    name: 'next-week',
    description: 'Gives you the assignments due next week',

    async execute(client, message, args) {

        /* Start of Google Stuff */

        // If modifying these scopes, delete token.json.
        const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        const TOKEN_PATH = 'token.json';

        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), weekEvents);
        });

        /**
         * Create an OAuth2 client with the given credentials, and then execute the
         * given callback function.
         * @param {Object} credentials The authorization client credentials.
         * @param {function} callback The callback to call with the authorized client.
         */
        function authorize(credentials, callback) {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
        }

        /**
         * Get and store new token after prompting for user authorization, and then
         * execute the given callback with the authorized OAuth2 client.
         * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
         * @param {getEventsCallback} callback The callback for the authorized client.
         */
        function getAccessToken(oAuth2Client, callback) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return console.error('Error retrieving access token', err);
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) return console.error(err);
                        console.log('Token stored to', TOKEN_PATH);
                    });
                    callback(oAuth2Client);
                });
            });
        }



        /* End of Google Stuff */


        // Lists the events in the next week

        function weekEvents(auth) {
            const calendar = google.calendar({ version: 'v3', auth });

            const eventDates = [];
            const eventSummaries = [];
            const eventDescriptions = [];
            const eventColors = [];

            var startDate = new Date();
            var endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            calendar.events.list({
                calendarId: '949qtctku1b132hle31l3crs6s@group.calendar.google.com',
                timeMin: startDate,
                timeMax: endDate,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err)
                try{
                    getNewAccessToken();
                }
                catch{
                    return console.log('The API returned an error: ' + err);
                }
                const events = res.data.items;
                if (events.length) {
                    events.map((event) => {
                        if(event.start.date != undefined) eventDates.push(event.start.date);
                        else eventDates.push(event.start.dateTime.split('T')[0]);
                        eventSummaries.push(event.summary);
                        eventDescriptions.push(event.description);
                        eventColors.push(event.colorId);
                    });

                    const EventsEmbed = new MessageEmbed()
                        .setTitle("This week\'s assignments.")

                    let text;

                    for (let i = 0; i < eventDates.length; i++) {
                        if (eventDescriptions[i]) text = `${eventDates[i].toString()}\n\n${eventDescriptions[i].toString()}`;
                        else text = `${eventDates[i].toString()}`;

                        let icon = "📚";
                        if (eventColors[i] == 11) icon = "❗";

                        let day = new Date(eventDates[i]).getDay();
                        EventsEmbed.addField(`${icon} ${weekday[day]} - ${eventSummaries[i]}`, `${text}`);
                    };

                    message.channel.send({ embeds: [EventsEmbed] });
                } else {
                    console.log('No upcoming events found.');
                }
            })
        }
    },
    async slash_command(client, interaction) {
        await interaction.deferReply();

        const eventDates = [];
        const eventSummaries = [];
        const eventDescriptions = [];
        const eventColors = [];

        /* Start of Google Stuff */


        // If modifying these scopes, delete token.json.
        const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        const TOKEN_PATH = 'token.json';

        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), weekEvents);
        });

        /**
         * Create an OAuth2 client with the given credentials, and then execute the
         * given callback function.
         * @param {Object} credentials The authorization client credentials.
         * @param {function} callback The callback to call with the authorized client.
         */
        function authorize(credentials, callback) {
            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client);
            });
        }

        /**
         * Get and store new token after prompting for user authorization, and then
         * execute the given callback with the authorized OAuth2 client.
         * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
         * @param {getEventsCallback} callback The callback for the authorized client.
         */
        function getAccessToken(oAuth2Client, callback) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return console.error('Error retrieving access token', err);
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                        if (err) return console.error(err);
                        console.log('Token stored to', TOKEN_PATH);
                    });
                    callback(oAuth2Client);
                });
            });
        }



        /* End of Google Stuff */


        // Lists the events in the next week

        function weekEvents(auth) {
            const calendar = google.calendar({ version: 'v3', auth });

            let startDate = new Date();
            let endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            calendar.events.list({
                calendarId: '949qtctku1b132hle31l3crs6s@group.calendar.google.com',
                timeMin: startDate,
                timeMax: endDate,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err)
                try{
                    getNewAccessToken();
                }
                catch{
                    return console.log('The API returned an error: ' + err);
                }
                const events = res.data.items;
                if (events.length) {
                    events.map((event) => {
                        if(event.start.date != undefined) eventDates.push(event.start.date);
                        else eventDates.push(event.start.dateTime.split('T')[0]);
                        eventSummaries.push(event.summary);
                        eventDescriptions.push(event.description);
                        eventColors.push(event.colorId);
                    });

                    const EventsEmbed = new MessageEmbed()
                        .setTitle("This week\'s assignments.")

                    let text;

                    for (let i = 0; i < eventDates.length; i++) {
                        if (eventDescriptions[i]) text = `${eventDates[i].toString()}\n\n${eventDescriptions[i].toString()}`;
                        else text = `${eventDates[i].toString()}`;

                        let icon = "📚";
                        if (eventColors[i] == 11) icon = "❗";

                        let day = new Date(eventDates[i]).getDay();
                        EventsEmbed.addField(`${icon} ${weekday[day]} - ${eventSummaries[i]}`, `${text}`);
                    };

                    interaction.followUp({ embeds: [EventsEmbed] });
                } else {
                    console.log('No upcoming events found.');
                }
            })
        }
    }
}
