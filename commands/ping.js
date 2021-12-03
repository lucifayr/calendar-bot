const { MessageEmbed } = require("discord.js");
const Color = "RANDOM";

module.exports = {
    name: 'ping',
    description: "Shows the latency on the Bot",
    
    slash_command(client, interaction) {
        const StartDate = Date.now();

        const Wait = new MessageEmbed()
            .setColor(`${Color}`)
            .setDescription(`Please Wait...`);

        interaction.reply({ embeds: [Wait] }).then(Msg => {
            const endDate = Date.now();

            const embed = new MessageEmbed()
                .setColor(Color)
                .setTitle(`Pong!`)
                .addField("Message Latency", `${Math.floor(endDate - StartDate)}ms`)
                .addField("API Latency", `${Math.round(client.ws.ping)}ms`)
                .setTimestamp(new Date);

            interaction.editReply({ embeds: [embed] });
        })
    },
    
    execute(client, message) {
        let StartDate = Date.now();
        const Wait = new MessageEmbed()
            .setColor(`${Color}`)
            .setDescription(`Please Wait...`);

        message.channel.send({ embeds: [Wait] }).then(Msg => {
            let EndDate = Date.now();

            const embed = new MessageEmbed()
                .setColor(Color)
                .setTitle(`Pong!`)
                .addField("Message Latency", `${Math.floor(EndDate - StartDate)}ms`)
                .addField("API Latency", `${Math.round(client.ws.ping)}ms`)
                .setTimestamp(new Date);

            Msg.delete();
            message.channel.send({ embeds: [embed] });
        });
    }
}