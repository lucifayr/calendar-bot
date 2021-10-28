const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require("fs");
const cron = require("cron");
const messages_send = [];
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
let first = true;
let start_date_saved;
let end_date_saved;

let eventIDList = [];

const Client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

function findId(currentId, idToFind) {
    return currentId == idToFind;
}

Client.config = require("./config.js");
Client.commands = new Discord.Collection();

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`Loading command ${file} as ${command.name}`);
    Client.commands.set(command.name.toLowerCase(), command);
}

Client.once("ready", () => {
    console.log("Client ready");

    const guild = Client.guilds.cache.get(Client.config.guild_id);
    const channel = guild.channels.cache.get(Client.config.channel_id);

    module.exports = { guild: guild, channel: channel };

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
        fs.readFile('credentials.json', (err, content) => {
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
                timeMin: start_date_saved,
                timeMax: end_date_saved,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    events.map((event, i) => {
                        if (eventIDList.indexOf(event.id) < 0) {
                            eventIDList.push(event.id);

                            const EventsEmbed = new MessageEmbed().setTitle("⚠️ New Assignment ⚠️");
                            let day = new Date(event.start.date).getDay();
                            let text;

                            let icon = "📚";
                            if (event.colorIds == 11) icon = "❗";

                            if (event.description) text = `${event.start.date.toString()}\n\n${event.description.toString()}`;
                            else text = `${event.start.date.toString()}`;

                            EventsEmbed.addField(`${icon} ${weekday[day]} - ${event.summary}`, `${text}`);

                            channel.send({ embeds: [EventsEmbed] }).then(msg => {
                                messages_send.push(msg);
                            });
                        }
                    });
                }
            });
        }

    })


    let scheduleMessage = new cron.CronJob('00 00 16 * * 5', () => {
        if (first) {
            first = false;
        } else {
            for (let i = 0; messages_send.length > 0; i++) {
                i = 0;
                messages_send[i].delete();
                messages_send.shift();
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
        //
        //
        //
        /* End of Google Stuff */


        // Lists the events in the next week

        function weekEvents(auth) {
            const calendar = google.calendar({ version: 'v3', auth });
            eventIDList = [];

            let startDate = new Date();
            let endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            start_date_saved = startDate;
            end_date_saved = endDate;
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
                        eventIDList.push(event.id);
                    });

                    const EventsEmbed = new MessageEmbed()
                        .setTitle("The ten next assignments.")

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
                        messages_send.push(msg);
                    });
                } else {
                    console.log('No upcoming events found.');
                }
            })
        }
    });

    scheduleMessage.start();

    fs.watch(Client.config.file_location, async(event, filename) => {
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
});

Client.on("messageCreate", message => {
    const prefix = Client.config.prefix;

    if (message.content.startsWith(`<@!${Client.user.id}>`)) {

        const mentionEmbed = new MessageEmbed()
            .setTitle(`The prefix: ${prefix}`)
            .addField('To start type: ', prefix + 'help')
            .setThumbnail(Client.user.displayAvatarURL())
            .setFooter(`${Client.user.username} Version: 1.0 by roteKlaue#0365 und jackboxx#0378`)
            .setTimestamp(new Date())

        message.channel.send({ embeds: [mentionEmbed] });
    }

    if ((message.content.indexOf(prefix) !== 0) || (message.author.bot) || (message.channel.type === 'dm') || (message.channel.type === 'GROUP_DM')) {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = Client.commands.get(command) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    if (!cmd) return;

    cmd.execute(Client, message, args);
});

Client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
        Client.commands.get(interaction.commandName).slash_command(Client, interaction);
    }
});

Client.login(Client.config.token);