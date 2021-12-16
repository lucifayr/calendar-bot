const { Client, Collection, Intents } = require('discord.js');
const fs = require("fs");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

client.config = require("./config.js");
client.commands = new Collection();
client.eventIDList = [];
client.messages_send = [];
client.__first_run__ = true;
client.end_date_saved;
client.start_date_saved;
client.guild;
client.channel;
client.listeners_active = false;

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

for (const file of commands) {
    const command = require(`./commands/${file}`);
    if (!command.name) continue;
    console.log(`Loading command ${file} as ${command.name}`);
    client.commands.set(command.name.toLowerCase(), command);
};

for (const file of events) {
    console.log(`Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};

client.login(client.config.token);