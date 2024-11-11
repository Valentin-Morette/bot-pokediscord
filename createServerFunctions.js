import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {
	EmbedBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ChannelType,
} from 'discord.js';
import { API } from './globalFunctions.js';

async function sendArenaMessage(
	message,
	channelName,
	arenaChampion,
	badgeName,
	arenaDescription,
	nbPokemon,
	nbPokemonDiff,
	newRole
) {
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);

	if (channel) {
		const attachment = new AttachmentBuilder(`./assets/arenaTrainer/${arenaChampion.toLowerCase()}.png`);
		const embed = new EmbedBuilder()
			.setColor('#3498db')
			.setTitle(arenaChampion)
			.setDescription(arenaDescription)
			.setThumbnail(`attachment://${arenaChampion.toLowerCase()}.png`);
		let row = new ActionRowBuilder();
		const button = new ButtonBuilder()
			.setCustomId(`badge|${nbPokemon}|${nbPokemonDiff}|${badgeName}|${newRole}`)
			.setStyle(ButtonStyle.Primary)
			.setLabel(channelName == '🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨' ? badgeName : `${badgeName} badge`);
		row.addComponents(button);
		await channel.send({
			embeds: [embed],
			files: [attachment],
			components: [row],
		});
	} else {
		console.error(`Aucun canal trouve avec le nom ${channelName}`);
	}
}

async function addBallEmojis(message) {
	try {
		const response = await API.get(`/pokeball`);
		response.data.forEach(async (pokeball) => {
			const emoji = await message.guild.emojis.create({
				name: pokeball.name,
				attachment: './assets/emojis/' + pokeball.name + '.png',
			});
		});
	} catch (error) {
		console.error(error);
	}
}

async function commandesMessage(message) {
	let channelName = '🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);

		const commandEmbed = new EmbedBuilder()
			.setColor('#FFFFFF')
			.setTitle('Liste des Commandes du Serveur')
			.setDescription(
				'**Recherche de Pokémon**\n' +
					'- `/cherche` : pour chercher un Pokémon.\n' +
					'- `/canne` : pour pêcher un Pokémon avec la canne.\n' +
					'- `/super-canne` : pour pêcher un Pokémon avec la super canne.\n' +
					'- `/mega-canne` : pour pêcher un Pokémon avec la méga canne.\n\n' +
					'**Vente de Pokémon**\n' +
					'- `/vendre [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un Pokémon.\n' +
					'- `/vendre-shiny [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un Pokémon shiny.\n\n' +
					'**Visualiser les Pokémon**\n' +
					"- `/pokedex [nom du dresseur (optionnel)]` : pour voir le Pokédex d'un dresseur.\n" +
					"- `/shinydex [nom du dresseur (optionnel)]` : pour voir le Shinydex d'un dresseur.\n" +
					'- `/quantite [nom du Pokémon]` : pour voir la quantité d’un Pokémon spécifique que vous possédez.\n' +
					'- `/quantite-shiny [nom du Pokémon]` : pour voir la quantité d’un Pokémon shiny spécifique que vous possédez.\n\n' +
					'**Évolution de Pokémon**\n' +
					'- `/nombre-evolution [nom du Pokémon]` : pour voir le nombre de Pokémon requis pour une évolution.\n' +
					'- `/evolution [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour faire évoluer un Pokémon.\n' +
					'- `/evolution-shiny [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour faire évoluer un Pokémon shiny.\n\n' +
					'**Inventaire et Finances**\n' +
					'- `/argent` : pour voir votre argent.\n' +
					'- `/ball` : pour voir toutes vos Pokéballs.\n' +
					'- `/prix [nom du Pokémon]` : pour voir le prix de vente d’un Pokémon.\n' +
					'- `/boutique` : pour ouvrir la boutique.\n\n' +
					'**Pokémon Disponibles et Échanges**\n' +
					'- `/disponible` : pour voir les Pokémon disponibles dans la zone.\n' +
					'- `/echange [nombre de Pokémon offerts] [nom du Pokémon offert] [nombre de Pokémon demandés] [nom du Pokémon demandé]` : pour échanger des Pokémon avec un autre joueur.\n' +
					'- `/zone [nom du Pokémon]` : pour voir les zones où apparaît un Pokémon.\n\n' +
					'**Utilisation et Achat de Runes**\n' +
					'- `/rune-utiliser [nom du Pokémon]` : pour utiliser une rune de Pokémon.\n' +
					'- `/rune-acheter [nom du Pokémon]` : pour acheter une rune de Pokémon.\n' +
					'- `/rune-prix [nom du Pokémon]` : pour voir le prix d’une rune de Pokémon.\n' +
					'- `/rune-inventaire` : pour voir les runes de Pokémon en votre possession.\n\n' +
					'**Affiliation**\n' +
					'- `/code-affiliation` : pour voir votre code d’affiliation.\n' +
					'- `/utiliser-code-affiliation [Code d’affiliation]` : pour utiliser un code d’affiliation. (Vous recevrez 10 000 pokédollars)\n\n'
			);
		await channel.send({ embeds: [commandEmbed] });
	} else {
		console.error(`No channel found with the name ${channelName}`);
	}
}

async function globalShopMessage(message) {
	let channelName = '🛒・𝐁𝐨𝐮𝐭𝐢𝐪𝐮𝐞';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);
		const attachment = new AttachmentBuilder(`./assets/shop.png`);

		const pokeballEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === 'pokeball');
		const superballEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === 'superball');
		const hyperballEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === 'hyperball');
		const masterballEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === 'masterball');

		const priceEmbed = new EmbedBuilder()
			.setColor('#FFFFFF')
			.setTitle('Bienvenue, Dresseur ! Jetez un œil à nos Pokéballs !')
			.setDescription(
				`${pokeballEmoji} Pokeball : 50 $\n\n` +
					`${superballEmoji} Superball : 80 $\n\n` +
					`${hyperballEmoji} Hyperball : 150 $\n\n` +
					`${masterballEmoji} Masterball : 100 000 $\n\n`
			)
			.setThumbnail(`attachment://shop.png`);
		await channel.send({ embeds: [priceEmbed], files: [attachment] });

		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		for (let i = 1; i <= 1000; i *= 10) {
			let row = new ActionRowBuilder();
			balls.forEach((ball) => {
				if (ball !== 'masterball' || i <= 10) {
					const customEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
					const button = new ButtonBuilder()
						.setCustomId('buy|' + i + '|' + ball)
						.setStyle(ButtonStyle.Secondary)
						.setLabel('' + i)
						.setEmoji(customEmoji.id);

					row.addComponents(button);
				}
			});
			await channel.send({ components: [row] });
		}
	} else {
		console.error(`No channel found with the name ${channelName}`);
	}
}

async function arenaMessagesGen1(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Reglisse',
		'Maître Pokémon',
		'Je suis Reglisse, le Champion de la Ligue Pokémon. Pour devenir Maître Pokémon, vous devez posséder les 151 Pokémon différents.',
		151,
		151,
		'Maître Pokémon'
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐫𝐠𝐞𝐧𝐭𝐚',
		'Caillou',
		'Roche',
		'Je suis Caillou, le Champion de type Roche. Pour obtenir le Badge Roche, vous devez avoir au moins 10 Pokémon, dont 5 différents.',
		10,
		5,
		'1 Badge'
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐳𝐮𝐫𝐢𝐚',
		'Flaquette',
		'Cascade',
		'Je suis Flaquette, la Championne de type Eau. Pour obtenir le Badge Cascade, vous devez avoir au moins 33 Pokémon, dont 12 différents.',
		33,
		12,
		'2 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐚𝐫𝐦𝐢𝐧-𝐬𝐮𝐫-𝐦𝐞𝐫',
		'SergentPile',
		'Foudre',
		'Je suis Sergent Pile, le Champion de type Électrique. Pour obtenir le Badge Foudre, vous devez avoir au moins 50 Pokémon, dont 20 différents.',
		50,
		20,
		'3 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐞𝐥𝐚𝐝𝐨𝐩𝐨𝐥𝐞',
		'Fleurika',
		'Prisme',
		'Je suis Fleurika, la Championne de type Plante. Pour obtenir le Badge Prisme, vous devez avoir au moins 67 Pokémon, dont 23 différents.',
		67,
		23,
		'4 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐚𝐫𝐦𝐚𝐧𝐢𝐞',
		'Kouga',
		'Ame',
		'Je suis Kouga, le Champion de type Poison. Pour obtenir le Badge Ame, vous devez avoir au moins 80 Pokémon, dont 30 différents.',
		80,
		30,
		'5 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐒𝐚𝐟𝐫𝐚𝐧𝐢𝐚',
		'Mordane',
		'Marais',
		'Je suis Mordane, la Championne de type Psy. Pour obtenir le Badge Marais, vous devez avoir au moins 99 Pokémon, dont 35 différents.',
		99,
		35,
		'6 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐫𝐚𝐦𝐨𝐢𝐬-𝐢𝐥𝐞',
		'Aoutiste',
		'Volcan',
		'Je suis Aoutiste, le Champion de type Feu. Pour obtenir le Badge Volcan, vous devez avoir au moins 115 Pokémon, dont 48 différents.',
		115,
		48,
		'7 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐉𝐚𝐝𝐢𝐞𝐥𝐥𝐞',
		'Giavonnou',
		'Terre',
		'Je suis Giavonnou, le Champion de type Sol. Pour obtenir le Badge Terre, vous devez avoir au moins 150 Pokémon, dont 61 différents.',
		150,
		61,
		'8 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Shinysse',
		'Maître Pokémon Shiny',
		'Je suis Shinysse, le maître des Pokémon shiny. Pour devenir Maître Pokémon Shiny, vous devez posséder les 151 Pokémon shiny différents.',
		151,
		151,
		'Maître Pokémon Shiny'
	);
}

async function channelZones(message) {
	const response = await API.get(`/zone/2`);
	response.data.forEach(async (zone) => {
		const channel = await message.guild.channels.create({
			name: '🌳・' + zone,
			type: ChannelType.GuildText,
		});
	});
}

function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log('Starting slash commands registration.');

			await rest.put(Routes.applicationGuildCommands(process.env.IDAPPLICATION, process.env.IDSERVER), {
				body: commands,
			});

			console.log('Slash commands registered successfully!');
		} catch (error) {
			console.error(error);
		}
	})();
}

export {
	addBallEmojis,
	slashCommande,
	arenaMessagesGen1,
	commandesMessage,
	globalShopMessage,
	channelZones,
};
