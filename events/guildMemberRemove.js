const anwsers = [{before: "**", after: "** just left the server"}];

const StringConcatenation = (username) => {
	const anwser = anwsers[Math.floor(Math.random() * anwsers.length)];
	return anwser.before + username + anwser.after;
}

module.exports = async (client, member) => {
	if (!client.listeners_active || member.bot) return;

	const guild = client.guilds.cache.get(member.guild_id);
	let channel = guild.channels.cache.get(guild.systemChannelId);
	
	if (member.guild_id === client.config.guild_id) channel = guild.channels.cache.get(client.config.welcome_channel_id);
	
	channel.send({ content: StringConcatenation(member.username + "#" + member.discriminator) });
}