import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {
	EmbedBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
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
			.setLabel(channelName == '🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨' ? badgeName : `Badge ${badgeName}`);
		row.addComponents(button);
		await channel.send({
			embeds: [embed],
			files: [attachment],
			components: [row],
		});
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
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
			.setTitle('Liste des Commandes du Serveur.')
			.setDescription(
				'**Chercher des Pokémon**\n' +
					'- `/cherche` : pour chercher un pokémon.\n' +
					'- `/canne` : pour pêcher un pokémon avec la canne.\n' +
					'- `/superCanne` : pour pêcher un pokémon avec la super canne.\n' +
					'- `/megaCanne` : pour pêcher un pokémon avec la mega canne.\n\n' +
					'**Vendre des Pokémon**\n' +
					'- `/vendre [nom du pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un pokémon.\n' +
					'- `/vendre-shiny [nom du pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un pokémon shiny.\n\n' +
					'**Consulter les Pokédex**\n' +
					"- `/pokedex [nom du dresseur (optionnel)]` : pour voir le pokédex d'un dresseur.\n" +
					"- `/shinydex [nom du dresseur (optionnel)]` : pour voir le pokédex shiny d'un dresseur.\n\n" +
					'**Évolution des Pokémon**\n' +
					'- `/nombre-evolution [nom du pokémon]` : pour voir le nombre de pokémon necessaire pour une évolution.\n' +
					'- `/evolution [nom du pokémon] [max (optionnel)] [quantité (optionnel)]` : pour faire évoluer un pokémon.\n' +
					'- `/evolution-shiny [nom du pokémon] [max (optionnel)] [quantité (optionnel)]` : pour faire évoluer un pokémon shiny.\n\n' +
					'**Inventaire et finances**\n' +
					'- `/argent` : pour voir votre argent.\n' +
					'- `/ball` : pour voir toutes vos pokéballs.\n' +
					"- `/prix [nom de la pokéball]` : pour voir le prix d'achat d'une pokéball.\n" +
					"- `/prix [nom du pokémon]` : pour voir le prix de vente d'un pokémon.\n\n" +
					'**Pokémons disponibles et échanges**\n' +
					'- `/disponible` : pour voir les pokémons disponibles dans la zone.\n' +
					'- `/echange [nombre pokemon proposé] [nom du pokemon proposé] [nombre pokemon demandé] [nom du pokemon demandé]` : pour échanger des pokémons avec un autre joueur.\n' +
					"- `/zone [nom du pokemon]` : pour voir les zones d'apparitions d'un pokémon.\n\n" +
					'**Utilisation et achat de runes**\n' +
					'- `/rune-utiliser [nom du pokémon]` : pour utiliser une rune de pokémon.\n' +
					'- `/rune-achat [nom du pokémon]` : pour acheter une rune de pokémon.\n' +
					"- `/rune-prix [nom du pokémon]` : pour voir le prix d'une rune de pokémon.\n" +
					'- `/rune-inventaire` : pour voir les runes de pokémon en votre possession.\n'
			);

		await channel.send({ embeds: [commandEmbed] });
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
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
			.setTitle('Bienvenu dresseur ! Jete un œil à nos Pokéballs !')
			.setDescription(
				`${pokeballEmoji} Pokéball : 50 $\n\n` +
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
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
	}
}

async function allMessage(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Reglisse',
		'Maitre Pokémon',
		'Je suis Reglisse, le maitre de la ligue pokémon. Pour devenir un Maître Pokémon, il vous faudra au minimum 1200 pokémons dont 151 différents.',
		1200,
		151,
		'Maître Pokémon'
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐫𝐠𝐞𝐧𝐭𝐚',
		'Caillou',
		'Roche',
		"Je suis Caillou, le champion d'arène de type roche. Pour obtenir le badge roche, il vous faudra au minimum 10 pokémons dont 5 différents.",
		10,
		5,
		'1 Badge'
	);

	sendArenaMessage(
		message,
		'🏠・𝐀𝐳𝐮𝐫𝐢𝐚',
		'Flaquette',
		'Cascade',
		"Je suis Flaquette, le champion d'arène de type eau. Pour obtenir le badge cascade, il vous faudra au minimum 33 pokémons dont 12 différents.",
		33,
		12,
		'2 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐚𝐫𝐦𝐢𝐧-𝐬𝐮𝐫-𝐌𝐞𝐫',
		'SergentPile',
		'Foudre',
		"Je suis le Sergent Pile, le champion d'arène de type Electrik. Pour obtenir le badge Foudre, il vous faudra au minimum 50 pokémons dont 20 différents.",
		50,
		20,
		'3 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐞𝐥𝐚𝐝𝐨𝐩𝐨𝐥𝐞',
		'Fleurika',
		'Prisme',
		"Je suis Fleurika, le champion d'arène de type plante. Pour obtenir le badge prisme, il vous faudra au minimum 67 pokémons dont 23 différents.",
		67,
		23,
		'4 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐚𝐫𝐦𝐚𝐧𝐢𝐞',
		'Kouga',
		'Ame',
		"Je suis Kouga, le champion d'arène de type poison. Pour obtenir le badge Âme, il vous faudra au minimum 80 pokémons dont 30 différents.",
		80,
		30,
		'5 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐒𝐚𝐟𝐫𝐚𝐧𝐢𝐚',
		'Mordane',
		'Marais',
		"Je suis Mordane, le champion d'arène de type psy. Pour obtenir le badge Marais, il vous faudra au minimum 99 pokémons dont 35 différents.",
		99,
		35,
		'6 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐫𝐚𝐦𝐨𝐢𝐬-𝐢𝐥𝐞',
		'Aoutiste',
		'Volcan',
		"Je suis Aoûtiste, le champion d'arène de type feu. Pour obtenir le badge Volcan, il vous faudra au minimum 115 pokémons dont 48 différents.",
		115,
		48,
		'7 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐉𝐚𝐝𝐢𝐞𝐥𝐥𝐞',
		'Giavonnou',
		'Terre',
		"Je suis Giavonnou, le champion d'arène de type sol. Pour obtenir le badge Terre, il vous faudra au minimum 150 pokémons dont 61 différents.",
		150,
		61,
		'8 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Shinysse',
		'Maitre Pokémon Shiny',
		'Je suis Shinysse, le maitre des pokémon shiny. Pour devenir un Maître Pokémon Shiny, il vous faudra les 151 pokémons shiny différents.',
		151,
		151,
		'Maître Pokémon Shiny'
	);
}

function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log("Début de l'enregistrement des commandes slash.");

			await rest.put(Routes.applicationGuildCommands(process.env.IDAPPLICATION, process.env.IDSERVER), {
				body: commands,
			});

			console.log('Commandes slash enregistrées avec succès !');
		} catch (error) {
			console.error(error);
		}
	})();
}

export { addBallEmojis, slashCommande, allMessage, commandesMessage, globalShopMessage };
