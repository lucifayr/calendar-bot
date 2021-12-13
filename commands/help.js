const { MessageEmbed } = require("discord.js");

const lel = (client, inter_mes, args) => {
    const COLOR = "BLUE";
    const helpEmbed = new MessageEmbed().setTitle('Help panel')
        .setFooter(`Bot Version: 1.0`).setColor(COLOR).setTimestamp(new Date())
        .setDescription('Find information on the command provided.')

    if (args) {
        const command = client.commands.get(args) || client.commands.find(x => x.aliases && x.aliases.includes(args));
        helpEmbed.addFields(
            { name: 'Name', value: command.name, inline: true },
            { name: 'Description', value: command.description, inline: true },
        )

    } else {
        client.commands.forEach(command => {
            helpEmbed.addField(command.name, command.description);
        });
    }

    return { embeds: [helpEmbed]};
}

module.exports = {
    name: 'help',
    description: 'Further Information',
    aliases: ['h'],

    options: [
        {
            name: "query",
            type: "STRING",
            description: "command you want more details about",
            required: false
        }
    ],

    execute(client, message, args) {
        message.channel.send(lel(client, message, args.join(" ")));
    },
    
    slash_command(client, interaction) {
        let help;
        
        if (interaction.options._hoistedOptions[0]) {
            help = interaction.options._hoistedOptions[0].value;
        }

        interaction.reply(lel(client, interaction, help));
    }
}