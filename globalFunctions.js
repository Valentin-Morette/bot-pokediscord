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

async function exportChannelHistory(channel, outputPath = null) {
	try {
		console.log(`📥 Début de l'export de l'historique du canal #${channel.name}...`);

		let allMessages = [];
		let lastId = null;
		let messageCount = 0;

		// Récupération de tous les messages
		while (true) {
			const options = { limit: 100 };
			if (lastId) {
				options.before = lastId;
			}

			const messages = await channel.messages.fetch(options);

			if (messages.size === 0) {
				break; // Plus de messages à récupérer
			}

			// Traitement des messages
			messages.forEach(message => {
				const messageData = {
					id: message.id,
					timestamp: message.createdTimestamp,
					date: message.createdAt.toISOString(),
					author: {
						id: message.author.id,
						username: message.author.username,
						displayName: message.member?.displayName || message.author.username
					},
					content: message.content,
					attachments: message.attachments.map(att => ({
						name: att.name,
						url: att.url,
						size: att.size
					})),
					embeds: message.embeds.map(embed => ({
						title: embed.title,
						description: embed.description,
						fields: embed.fields,
						color: embed.color,
						thumbnail: embed.thumbnail?.url,
						image: embed.image?.url,
						footer: embed.footer?.text
					}))
				};

				allMessages.unshift(messageData); // Ajouter au début pour garder l'ordre chronologique
			});

			lastId = messages.last().id;
			messageCount += messages.size;

			console.log(`📊 ${messageCount} messages récupérés...`);

			// Petite pause pour éviter de surcharger l'API Discord
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		console.log(`✅ Export terminé ! ${allMessages.length} messages récupérés.`);

		// Si un chemin de sortie est spécifié, sauvegarder dans un fichier
		if (outputPath) {
			const fs = await import('fs/promises');
			const data = {
				exportDate: new Date().toISOString(),
				messages: allMessages
			};

			await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
			console.log(`💾 Données sauvegardées dans ${outputPath}`);
		}

		return allMessages;

	} catch (error) {
		console.error('❌ Erreur lors de l\'export:', error);
		throw error;
	}
}

const API = axios.create({
	baseURL: process.env.VITE_BACKEND_URL ?? 'http://localhost:3000',
	headers: {
		'X-API-KEY': process.env.API_KEY,
	},
});

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
	exportChannelHistory,
	API,
};
