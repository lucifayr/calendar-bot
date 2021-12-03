const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const getNewAccessToken = require("../functions/googleAuthentication.js").getNewAccessToken;
const authorize = require("../functions/googleAuthentication.js").authorize;
const { MessageEmbed } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs');

module.exports = {
    name: 'next-week',
    description: 'Gives you the assignments due next week',

    async execute(client, message, args) {

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), weekEvents);
        });

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
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    events.map((event) => {
                        if(event.start.date != undefined) eventDates.push(event.start.date)
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

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), weekEvents);
        });

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
                if (err) {
                    try{
                        getNewAccessToken();
                    }
                    catch{
                        return console.log('The API returned an error: ' + err);
                    }
                }
                
                const events = res.data.items;
                if (events.length) {
                    events.map((event) => {
                        if(event.start.date != undefined) eventDates.push(event.start.date)
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
