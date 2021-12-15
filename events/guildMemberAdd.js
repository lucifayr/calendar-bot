const canvas = require('canvas');
const jimp = require('jimp');

module.exports = (client, member) => {
	if (!client.listeners) return;

	const channel = client.guild.channels.cache.get(client.config.channel_welcome_id);
	
}