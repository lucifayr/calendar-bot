const { createCanvas, loadImage } = require('canvas');
const roundRect = require('../functions/rounded.js');
const { MessageAttachment } = require('discord.js');
const Circle = require("../functions/circle.js");
const Color = require('../functions/color.js');
const Blur = require('../functions/blur.js');

module.exports = async (client, member) => {
	if (!client.listeners_active || member.bot) return;

	const guild = client.guilds.cache.get(member.guild_id);
	const channel = guild.channels.cache.get(guild.systemChannelId);
	const user = client.users.cache.get(member.id);
	
	const canvas = createCanvas(700 * 3, 250 * 3);
	let ctx = canvas.getContext('2d');

	ctx = new roundRect().getCTX(ctx, 0, 0, 700 * 3, 250 * 3, 250 * 3 / 15);
	ctx.clip();

	ctx.font = "60px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.drawImage(await loadImage(await new Blur().getImage(`${__dirname}/../Images/canvas.png`, 5)), 0, 0, 700 * 3, 250 * 3);
	ctx.drawImage(await loadImage(await new Circle().getImage(await new Color().getImage("#444444"))), 100, 100, 550, 550);
	ctx.drawImage(await loadImage(await new Circle().getImage(user.displayAvatarURL({ dynamic: false, format: 'png' }))), 135, 135, 480, 480);
	ctx.fillText(`${member.username}#${member.discriminator} just joined the server`, 150 + 480 + 70, 135);
	ctx.fillText(`member #${guild.memberCount}`, 150 + 480 + 70, 215);

	channel.send({ files:[new MessageAttachment(canvas.toBuffer(), `Welcome_${member.username}.png`)] });
}