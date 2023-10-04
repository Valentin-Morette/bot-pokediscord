import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNombreAvecSeparateur(n) {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function createButtons(message, catchCode) {
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	let row = new ActionRowBuilder();
	balls.forEach((ball) => {
		const customEmoji = message.guild.emojis.cache.find(
			(emoji) => emoji.name === ball
		);
		const button = new ButtonBuilder()
			.setCustomId(ball + '|' + catchCode)
			.setStyle(ButtonStyle.Secondary);
		button[customEmoji ? 'setEmoji' : 'setLabel'](
			customEmoji ? customEmoji.id : ball
		);

		row.addComponents(button);
	});

	return row;
}

function heartbeat(client) {
	setInterval(() => {
		client.ws.ping;
	}, 300000);
}

export {
	capitalizeFirstLetter,
	formatNombreAvecSeparateur,
	createButtons,
	heartbeat,
};
