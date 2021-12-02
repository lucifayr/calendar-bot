module.exports = (client, interaction) => {
    if (interaction.isCommand() && client.commands.get(interaction.commandName)) {
        client.commands.get(interaction.commandName).slash_command(client, interaction);
    } else {
        interaction.reply("This command has sadly been removed.");
    }
}