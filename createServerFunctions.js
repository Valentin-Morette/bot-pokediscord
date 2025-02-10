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
	newRole,
	generation
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
			.setCustomId(`badge|${nbPokemon}|${nbPokemonDiff}|${badgeName}|${newRole}|${generation}`)
			.setStyle(ButtonStyle.Primary)
			.setLabel(channelName == '🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨' ? badgeName : `Badge ${badgeName}`);
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
					"- `/pokedex [numero de generation (optionnel)][nom du dresseur (optionnel)]` : pour voir le Pokédex d'un dresseur.\n" +
					"- `/shinydex [numero de generation (optionnel)][nom du dresseur (optionnel)]` : pour voir le Shinydex d'un dresseur.\n" +
					'- `/pokedex-liste` : pour voir le résumé de tous les Pokédex.\n' +
					'- `/shinydex-liste` : pour voir le résumé de tous les Shinydex.\n' +
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
					'- `/cadeau` : pour recevoir votre cadeau toutes les 12 heures.\n' +
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
		'Maitre Pokémon',
		'Je suis Reglisse, le Champion de la Ligue Pokémon. Pour devenir Maitre Pokémon, vous devez posséder les 151 Pokémon différents de la génération 2.',
		151,
		151,
		'Maitre Pokémon',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐫𝐠𝐞𝐧𝐭𝐚',
		'Caillou',
		'Roche',
		'Je suis Caillou, le Champion de type Roche. Pour obtenir le Badge Roche, vous devez avoir au moins 10 Pokémon, dont 5 différents de la génération 1',
		10,
		5,
		'1 Badge',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐳𝐮𝐫𝐢𝐚',
		'Flaquette',
		'Cascade',
		'Je suis Flaquette, la Championne de type Eau. Pour obtenir le Badge Cascade, vous devez avoir au moins 33 Pokémon, dont 12 différents de la génération 1',
		33,
		12,
		'2 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐚𝐫𝐦𝐢𝐧-𝐬𝐮𝐫-𝐦𝐞𝐫',
		'SergentPile',
		'Foudre',
		'Je suis Sergent Pile, le Champion de type Électrique. Pour obtenir le Badge Foudre, vous devez avoir au moins 50 Pokémon, dont 20 différents de la génération 1',
		50,
		20,
		'3 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐞𝐥𝐚𝐝𝐨𝐩𝐨𝐥𝐞',
		'Fleurika',
		'Prisme',
		'Je suis Fleurika, la Championne de type Plante. Pour obtenir le Badge Prisme, vous devez avoir au moins 67 Pokémon, dont 23 différents de la génération 1',
		67,
		23,
		'4 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐚𝐫𝐦𝐚𝐧𝐢𝐞',
		'Kouga',
		'Ame',
		'Je suis Kouga, le Champion de type Poison. Pour obtenir le Badge Ame, vous devez avoir au moins 80 Pokémon, dont 30 différents de la génération 1',
		80,
		30,
		'5 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐒𝐚𝐟𝐫𝐚𝐧𝐢𝐚',
		'Mordane',
		'Marais',
		'Je suis Mordane, la Championne de type Psy. Pour obtenir le Badge Marais, vous devez avoir au moins 99 Pokémon, dont 35 différents de la génération 1',
		99,
		35,
		'6 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐫𝐚𝐦𝐨𝐢𝐬-𝐢𝐥𝐞',
		'Aoutiste',
		'Volcan',
		'Je suis Aoutiste, le Champion de type Feu. Pour obtenir le Badge Volcan, vous devez avoir au moins 115 Pokémon, dont 48 différents de la génération 1',
		115,
		48,
		'7 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐉𝐚𝐝𝐢𝐞𝐥𝐥𝐞',
		'Giavonnou',
		'Terre',
		'Je suis Giavonnou, le Champion de type Sol. Pour obtenir le Badge Terre, vous devez avoir au moins 150 Pokémon, dont 61 différents de la génération 1',
		150,
		61,
		'8 Badges',
		1
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Shinysse',
		'Maitre Pokémon Shiny',
		'Je suis Shinysse, le maitre des Pokémon shiny. Pour devenir Maitre Pokémon Shiny, vous devez posséder les 151 Pokémon shiny différents de la génération 1',
		151,
		151,
		'Maitre Pokémon Shiny',
		1
	);
}

async function arenaMessagesGen2(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Gold',
		'Maitre Pokémon Gen2',
		'Je suis Gold, le Champion de la Ligue Pokémon. Pour devenir Maitre Pokémon, vous devez posséder les 100 Pokémon différents de la génération 2.',
		100,
		100,
		'Maitre Pokémon Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐌𝐚𝐮𝐯𝐢𝐥𝐥𝐞',
		'Aile-bert',
		'Zéphyr',
		'Je suis Aile-bert, le Champion de type Vol. Pour obtenir le Badge Zéphyr, vous devez avoir au moins 10 Pokémon, dont 5 différents de la génération 2.',
		10,
		5,
		'1 Badge Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐄𝐜𝐨𝐫𝐜𝐢𝐚',
		'Insektor',
		'Nymphe',
		'Je suis Insektor, la Championne de type Insecte. Pour obtenir le Badge Nymphe, vous devez avoir au moins 33 Pokémon, dont 12 différents de la génération 2.',
		33,
		9,
		'2 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐃𝐨𝐮𝐛𝐥𝐨𝐧𝐯𝐢𝐥𝐥𝐞',
		'Rouge',
		'Plaine',
		'Je suis Rouge, le Champion de type Normal. Pour obtenir le Badge Plaine, vous devez avoir au moins 50 Pokémon, dont 20 différents de la génération 2.',
		50,
		16,
		'3 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐑𝐨𝐬𝐚𝐥𝐢𝐚',
		'Mortimystere',
		'Brume',
		'Je suis Mortimystère, la Championne de type Spectre. Pour obtenir le Badge Brume, vous devez avoir au moins 67 Pokémon, dont 23 différents de la génération 2.',
		67,
		19,
		'4 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐈𝐫𝐢𝐬𝐢𝐚',
		'Chique',
		'Choc',
		'Je suis Chique, le Champion de type Combat. Pour obtenir le Badge Choc, vous devez avoir au moins 80 Pokémon, dont 30 différents de la génération 2.',
		80,
		26,
		'5 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐎𝐥𝐢𝐯𝐢𝐥𝐥𝐞',
		'Ferasmine',
		'Minéral',
		'Je suis Ferasmine, la Championne de type Acier. Pour obtenir le Badge Minéral, vous devez avoir au moins 99 Pokémon, dont 35 différents de la génération 2.',
		99,
		31,
		'6 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐜𝐚𝐣𝐨𝐮',
		'Frigo',
		'Glacier',
		'Je suis Frigo, le Champion de type Glace. Pour obtenir le Badge Glacier, vous devez avoir au moins 115 Pokémon, dont 48 différents de la génération 2.',
		115,
		38,
		'7 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐄𝐛𝐞𝐧𝐞𝐥𝐥𝐞',
		'Salamandra',
		'Levant',
		'Je suis Salamandra, le Champion de type Dragon. Pour obtenir le Badge Levant, vous devez avoir au moins 150 Pokémon, dont 61 différents de la génération 2.',
		150,
		49,
		'8 Badges Gen2',
		2
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Goldysse',
		'Maitre Pokémon Shiny Gen2',
		'Je suis Goldysse, le maitre des Pokémon shiny. Pour devenir Maitre Pokémon Shiny Gen 2, vous devez posséder les 100 Pokémon shiny différents de la génération 2.',
		100,
		100,
		'Maitre Pokémon Shiny Gen2',
		2
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
	arenaMessagesGen2,
	commandesMessage,
	globalShopMessage,
	channelZones,
};
