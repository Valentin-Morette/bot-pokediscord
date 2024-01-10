import { ButtonBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';

function upFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNombreAvecSeparateur(n) {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function createButtons(message, catchCode) {
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	let row = new ActionRowBuilder();
	balls.forEach((ball) => {
		const customEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
		const button = new ButtonBuilder()
			.setCustomId(ball + '|' + catchCode)
			.setStyle(ButtonStyle.Secondary);
		button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

		row.addComponents(button);
	});

	return row;
}

function createListEmbed(
	items = null,
	title = null,
	footer = null,
	thumbnailUrl = null,
	img = null,
	color = '#FFFFFF'
) {
	let embed = new EmbedBuilder().setColor(color);

	if (title) {
		embed.setTitle(title);
	}
	if (thumbnailUrl) {
		embed.setThumbnail(thumbnailUrl);
	}
	if (footer) {
		embed.setFooter({ text: footer });
		embed.setTimestamp();
	}
	if (img) {
		embed.setImage(img);
	}

	if (items) {
		if (typeof items === 'string') {
			embed.setDescription(items);
		} else if (Array.isArray(items) && items.length > 0) {
			const columns = [[], [], []];
			let tiers = Math.ceil(items.length / 3);

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const columnIndex = Math.floor(i / tiers);
				columns[columnIndex].push(item);
			}

			columns.forEach((col) => {
				if (col.length > 0) {
					embed.addFields({ name: ' ', value: col.join('\n'), inline: true });
				}
			});
		}
	}

	return embed;
}

function heartbeat(client) {
	setInterval(() => {
		client.ws.ping;
	}, 300000);
}

export { upFirstLetter, formatNombreAvecSeparateur, createButtons, heartbeat, createListEmbed };
