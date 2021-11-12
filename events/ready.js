const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const cron = require("cron");
const fs = require('fs');

module.exports = client => {
	console.log("Client ready");

    const guild = client.guilds.cache.get(client.config.guild_id);
    const channel = guild.channels.cache.get(client.config.channel_id);

    client.channel = channel;
    client.guild = guild;

	let scheduleCheck = new cron.CronJob('00 59 5,11,17,23 * * *', () => {
        const readline = require('readline');
        const { google } = require('googleapis');

        /* Start of Google Stuff */
        //
        //
        //
        // If modifying these scopes, delete token.json.
        const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        const TOKEN_PATH = 'token.json';

        // Load client secrets from a local file.
        fs.readFile('../credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), checkEvents);
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
        //
        //
        //
        /* End of Google Stuff */

        function checkEvents(auth) {
            const calendar = google.calendar({ version: 'v3', auth });
            calendar.events.list({
                calendarId: '949qtctku1b132hle31l3crs6s@group.calendar.google.com',
                timeMin: client.start_date_saved,
                timeMax: client.end_date_saved,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    events.map((event, i) => {
                        if (client.eventIDList.indexOf(event.id) < 0) {
                            client.eventIDList.push(event.id);

                            const EventsEmbed = new MessageEmbed().setTitle("⚠️ New Assignment ⚠️");
                            let day = new Date(event.start.date).getDay();
                            let text;

                            let icon = "📚";
                            if (event.colorIds == 11) icon = "❗";

                            if (event.description) text = `${event.start.date.toString()}\n\n${event.description.toString()}`;
                            else text = `${event.start.date.toString()}`;

                            EventsEmbed.addField(`${icon} ${weekday[day]} - ${event.summary}`, `${text}`);

                            channel.send({ embeds: [EventsEmbed] }).then(msg => {
                                client.messages_send.push(msg);
                            });
                        }
                    });
                }
            });
        }

    })


    let scheduleMessage = new cron.CronJob('00 00 16 * * 5', () => {
        if (client.__first_run__) {
            client.__first_run__ = false;
        } else {
            for (let i = 0; client.messages_send.length > 0; i++) {
                i = 0;
                client.messages_send[i].delete();
                client.messages_send.shift();
            }
        }

        const readline = require('readline');
        const { google } = require('googleapis');

        const eventDates = [];
        const eventSummaries = [];
        const eventDescriptions = [];
        const eventColors = [];

        /* Start of Google Stuff */
        //
        //
        //
        // If modifying these scopes, delete token.json.
        const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        const TOKEN_PATH = 'token.json';

        // Load client secrets from a local file.
        fs.readFile('../credentials.json', (err, content) => {
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
        //
        //
        //
        /* End of Google Stuff */


        // Lists the events in the next week

        function weekEvents(auth) {
            const calendar = google.calendar({ version: 'v3', auth });
            client.eventIDList = [];

            let startDate = new Date();
            let endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            client.start_date_saved = startDate;
            client.end_date_saved = endDate;
            scheduleCheck.start();

            calendar.events.list({
                calendarId: '949qtctku1b132hle31l3crs6s@group.calendar.google.com',
                timeMin: startDate,
                timeMax: endDate,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    events.map((event, i) => {
                        eventDates.push(event.start.date);
                        eventSummaries.push(event.summary);
                        eventDescriptions.push(event.description);
                        eventColors.push(event.colorId);
                        client.eventIDList.push(event.id);
                    });

                    const EventsEmbed = new MessageEmbed()
                        .setTitle("This weeks assignments.")

                    let text;

                    for (let i = 0; i < eventDates.length; i++) {
                        if (eventDescriptions[i]) text = `${eventDates[i].toString()}\n\n${eventDescriptions[i].toString()}`;
                        else text = `${eventDates[i].toString()}`;

                        let icon = "📚";
                        if (eventColors[i] == 11) icon = "❗";

                        let day = new Date(eventDates[i]).getDay();
                        EventsEmbed.addField(`${icon} ${weekday[day]} - ${eventSummaries[i]}`, `${text}`);
                    };

                    channel.send({ embeds: [EventsEmbed] }).then(msg => {
                        client.messages_send.push(msg);
                    });
                } else {
                    console.log('No upcoming events found.');
                }
            })
        }
    });

    scheduleMessage.start();

    fs.watch(client.config.file_location, async(event, filename) => {
        if (filename === Client.config.file_name) {
            if (event === 'rename') {
                fs.writeFile(`${Client.config.file_location}${Client.config.file_name}`, '', function callbackFunction() {});
            } else if (event === 'change') {
                const content = fs.readFileSync(`${Client.config.file_location}${Client.config.file_name}`);

                console.log(content.toString());

                channel.send({ content: `${await content.toString()}` }).catch(err => console.error(err));
            }
        }
    });
}