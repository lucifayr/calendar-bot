module.exports = (client, interaction) => {
    if (interaction.isCommand() && Client.commands.get(interaction.commandName)) {
        Client.commands.get(interaction.commandName).slash_command(client, interaction);
    } else {
        interaction.reply("Invalid Command");
    }
}