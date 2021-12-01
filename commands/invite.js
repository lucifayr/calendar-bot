const { MessageEmbed } = require("discord.js");
const a = new MessageEmbed()
    .setAuthor("Invite Me", "https://discord.com/api/oauth2/authorize?client_id=897878642355499009&permissions=0&scope=bot%20applications.commands")
    .setColor("BLUE")
    .setTimestamp(new Date())
    .setDescription("https://discord.com/api/oauth2/authorize?client_id=897878642355499009&permissions=0&scope=bot%20applications.commands")

module.exports = {
    name: 'invite',
    description: "Invitation Link",
    
    slash_command(client, interaction) {
        interaction.reply({ embeds: [a] });
    },

    execute(client, message, args) {
        message.channel.send({ embeds: [a] });
    }
}