const weekEvents = require("../functions/googleAuthentication.js").weekEvents;
const authorize = require("../functions/googleAuthentication.js").authorize;
const fs = require('fs');

module.exports = {
    name: 'next-week',
    description: 'Gives you the assignments due next week',

    execute(client, message) {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), weekEvents, message, "message", message.channel);
        });
    },

    async slash_command(client, interaction) {
        await interaction.deferReply();

        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), weekEvents, interaction, "interaction");
        });
    }
}