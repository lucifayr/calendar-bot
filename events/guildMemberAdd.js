const sentences = ["just joined the server", "sneaked on to the server", "is now roaming the server", "got lost and ended up here", "traveled here", "finnaly arrived", "doesn't really want to be here", "resides among us now", "has entered the chat"];
const { createCanvas, loadImage } = require('canvas');
const roundRect = require('../functions/rounded.js');
const CenterText = require('../functions/centerText');
const { MessageAttachment } = require('discord.js');
const Circle = require("../functions/circle.js");
const Color = require('../functions/color.js');
const Blur = require('../functions/blur.js');

module.exports = async (client, member) => {
	if (!client.listeners_active || member.bot) return;

	const guild = client.guilds.cache.get(member.guild_id);
	let channel = guild.channels.cache.get(guild.systemChannelId);
	
	if (member.guild_id === client.config.guild_id) channel = guild.channels.cache.get(client.config.welcome_channel_id);

	const user = client.users.cache.get(member.id);
	
	const canvas = createCanvas(700 * 3, 250 * 3);
	let ctx = canvas.getContext('2d');

	ctx = new roundRect().getCTX(ctx, 0, 0, 700 * 3, 250 * 3, 250 * 3 / 15);
	ctx.clip();

	ctx.font = "90px Arial";
	ctx.fillStyle = "#ffffff";
	
	ctx.drawImage(await loadImage(await new Blur().getImage(`${__dirname}/../Images/canvas.png`, 5)), 0, 0, 700 * 3, 250 * 3);
	ctx.drawImage(await loadImage(await new Circle().getImage(await new Color().getImage("#444444"))), 100, 100, 550, 550);
	ctx.drawImage(await loadImage(await new Circle().getImage(user.displayAvatarURL({ dynamic: false, format: 'png' }))), 135, 135, 480, 480);

	ctx = new CenterText().centerText(ctx, `${member.username}#${member.discriminator}`, 630, 300, 2100, true);
	ctx = new CenterText().centerText(ctx, sentences[Math.floor(Math.random() * sentences.length)], 630, 400, 2100, true);
	
	ctx.font = "60px Arial";
	
	ctx.fillText(`member #${guild.memberCount}`, 1700, 685);

	channel.send({ files:[new MessageAttachment(canvas.toBuffer(), `Welcome_${member.username}.png`)] });
}