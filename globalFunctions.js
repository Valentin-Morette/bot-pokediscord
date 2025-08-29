import axios from 'axios';
import { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

function upFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNombreAvecSeparateur(n) {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function createButtons(message, idPokemonWild) {
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	let row = new ActionRowBuilder();
	const fallbackEmojiByBall = { pokeball: '🔴', superball: '🔵', hyperball: '⚫', masterball: '🟣' };
	balls.forEach((ball) => {
		const customEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
		const button = new ButtonBuilder()
			.setCustomId(ball + '|' + idPokemonWild)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(customEmoji ? customEmoji.id : fallbackEmojiByBall[ball]);

		row.addComponents(button);
	});

	return row;
}

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUserAdmin(member) {
	return member.permissions.has(PermissionFlagsBits.Administrator);
}

function formatRemainingTime(milliseconds) {
	const totalMinutes = Math.floor(milliseconds / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return `${hours}h${minutes.toString().padStart(2, '0')}min`;
}

function createListEmbed(
	items = null,
	title = null,
	footer = null,
	thumbnailUrl = null,
	img = null,
	color = '#FFFFFF',
	needTimestamp = true
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
		if (needTimestamp) {
			embed.setTimestamp();
		}
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

function correctNameZone(name) {
	return name
		.replace(/^.*?・/, '')
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[\u0300-\u036f]/g, '');
}

function removeAccents(str) {
	if (typeof str !== 'string') return '';
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findParentCategory(channel) {
	let currentChannel = channel;
	while (currentChannel.parent) {
		if (currentChannel.parent.type === 4) {
			return currentChannel.parent;
		}
		currentChannel = currentChannel.parent;
	}
	return null;
}



const API = axios.create({
	baseURL: process.env.VITE_BACKEND_URL ?? 'http://localhost:3000',
	headers: {
		'X-API-KEY': process.env.API_KEY,
	},
});

// Fonction pour logger les événements
async function logEvent(type, category, message, idServer = null, idDiscord = null) {
	try {
		const logData = {
			idServer,
			idDiscord,
			type,
			category,
			message,
		};

		await API.post('/logs', logData);
	} catch (error) {
		// Fallback vers console.log si l'API échoue
		console.error('❌ Erreur lors du logging:', error.message);
		console.log(`[${type.toUpperCase()}] [${category.toUpperCase()}] ${message}`);
	}
}

export {
	upFirstLetter,
	wait,
	formatNombreAvecSeparateur,
	createButtons,
	createListEmbed,
	correctNameZone,
	formatRemainingTime,
	removeAccents,
	isUserAdmin,
	findParentCategory,
	logEvent,
	API,
};
