const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const authorize = require("../functions/googleAuthentication.js");
const { google } = require('googleapis');
const cron = require("cron");
const fs = require('fs');

module.exports = client => {
	console.log("Client ready");

    const guild = client.guilds.cache.get(client.config.guild_id);
    const channel = guild.channels.cache.get(client.config.channel_id);

    client.channel = channel;
    client.guild = guild;

	let scheduleCheck = new cron.CronJob('00 59 5,11,17,23 * * *', () => {

        fs.readFile('../credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), checkEvents);
        });

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

        const eventDates = [];
        const eventSummaries = [];
        const eventDescriptions = [];
        const eventColors = [];

        /* Start of Google Stuff */

        // Load client secrets from a local file.
        fs.readFile('../credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(JSON.parse(content), weekEvents);
        });
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