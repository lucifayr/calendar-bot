const Discord = require('discord.js');
const fs = require("fs");

const Client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]
});

Client.config = require("./config.js");
Client.commands = new Discord.Collection();
Client.eventIDList = [];
Client.messages_send = [];
Client.__first_run__ = true;
Client.end_date_saved;
Client.start_date_saved;
Client.guild;
Client.channel;
Client.listeners = false;

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`Loading command ${file} as ${command.name}`);
    Client.commands.set(command.name.toLowerCase(), command);
};

for (const file of events) {
    console.log(`Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    Client.on(file.split(".")[0], event.bind(null, Client));
};

Client.login(Client.config.token);