const { MessageEmbed } = require('discord.js');

const registering = (client, second) => {
    if (!second.member.permissions.has("ADMINISTRATOR")) return new MessageEmbed().setTitle("Failed to create slash-commands").setDescription("You do not have permissions to create slash-commands");

    const embed = new MessageEmbed()
        .setTitle("Success")

    client.commands.forEach(command => {
        second.guild.commands?.create(command).catch(error => {
            return new MessageEmbed().setTitle("Failed to create slash-commands").setDescription(error.toString());
        });
    });

    return embed;
}

module.exports = {
    name: 'slash-commands-create',
    description: 'Create\'s slash commands which have been been specified beforehand.',
    aliases: ['create', 'slash'],

    async execute(client, message, args) {
        const embed = registering(client, message);

        message.channel.send({ embeds: [embed] });

    },

    slash_command(client, interaction) {
        const embed = registering(client, interaction);

        interaction.reply({ embeds: [embed] });
    }
}