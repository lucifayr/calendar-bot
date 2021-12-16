"use strict";

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const { MessageEmbed } = require('discord.js');
const { google } = require('googleapis');
const readline = require('readline');
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';
const axios = require("axios");
const fs = require('fs');

const authorize = (credentials, callback, interaction, type, channel, client) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback, interaction, type, channel, client);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, interaction, type, channel, client);
    });
}

const getAccessToken = (oAuth2Client, callback, interaction, type, channel, client) => {
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
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client, interaction, type, channel, client);
        });
    });
}

const refreshAccessToken = async(refreshToken, clientID, clientSecret) => {

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

const getNewAccessToken = () => {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) return console.log(err);
        const { client_id, client_secret } = JSON.parse(content).installed
        fs.readFile(TOKEN_PATH, (err, content) => {
            if (err) return console.log(err);
            const token = JSON.parse(content).refresh_token;
            return refreshAccessToken(token, client_id, client_secret);
        })
    })
}


const weekEvents = (auth, interaction, type, channel) => {

    const eventDates = [];
    const eventSummaries = [];
    const eventDescriptions = [];
    const eventColors = [];

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
        if (err) {
            try {
                getNewAccessToken();
            } catch {
                return console.log('The API returned an error: ' + err);
            }
        }

        const events = res.data.items;
        if (events.length) {
            events.map((event) => {
                if (event.start.date != undefined) eventDates.push(event.start.date);
                else eventDates.push(event.start.dateTime.split('T'));
                eventSummaries.push(event.summary);
                eventDescriptions.push(event.description);
                eventColors.push(event.colorId);
            });

            const EventsEmbed = new MessageEmbed()
                .setTitle("This week's assignments.")

            let text;

            for (let i = 0; i < eventDates.length; i++) {
                if (eventDescriptions[i]) text = `${eventDates[i].toString()}\n\n${eventDescriptions[i].toString()}`;
                else text = `${eventDates[i].toString()}`;

                let icon = "📚";
                if (eventColors[i] == 11) icon = "❗";

                let day = new Date(eventDates[i]).getDay();
                EventsEmbed.addField(`${icon} ${weekday[day]} - ${eventSummaries[i]}`, `${text}`);
            };

            if (type === "interaction") {
                interaction.followUp({ embeds: [EventsEmbed] });
            } else if (type == "message") {
                if (!channel) throw new Error("I need the channel if it is a message.");
                channel.send({ embeds: [EventsEmbed] }).catch(error => console.log(error));
            } else throw new Error("Unknown event type: " + type);
        } else {
            console.log('No upcoming events found.');
        }
    })
}

module.exports = {
    getNewAccessToken,
    authorize,
    weekEvents
}