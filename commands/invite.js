const { MessageEmbed } = require("discord.js");
const a = new MessageEmbed()
    .setAuthor("Invite Me", "https://discord.com/api/oauth2/authorize?client_id=897878642355499009&permissions=0&scope=bot%20applications.commands")
    .setColor("BLUE")
    .setTimestamp(new Date())
    .setDescription("https://discord.com/api/oauth2/authorize?client_id=897878642355499009&permissions=0&scope=bot%20applications.commands")

module.exports = {
    name: 'invite',
    category: 'Core',
    description: "Invitation Link",
    permissions: [],
    cooldown: 0,

    slash_command(client, interaction) {
        interaction.reply({ embeds: [a] });
    },
    execute(client, message, args) {
        message.channel.send({ embeds: [a] });
    }
}