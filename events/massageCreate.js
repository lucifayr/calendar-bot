module.exports = (client, message) => {
    const prefix = Client.config.prefix;

    if (message.content.startsWith(`<@!${Client.user.id}>`)) {

        const mentionEmbed = new MessageEmbed()
            .setTitle(`The prefix: ${prefix}`)
            .addField('To start type: ', prefix + 'help')
            .setThumbnail(Client.user.displayAvatarURL())
            .setFooter(`${Client.user.username} Version: 1.0 by roteKlaue#0365 und jackboxx#0378`)
            .setTimestamp(new Date())

        message.channel.send({ embeds: [mentionEmbed] });
    }

    if ((message.content.indexOf(prefix) !== 0) || (message.author.bot) || (message.channel.type === 'dm') || (message.channel.type === 'GROUP_DM')) {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = Client.commands.get(command) || Client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    if (!cmd) return;

    cmd.execute(Client, message, args);
}