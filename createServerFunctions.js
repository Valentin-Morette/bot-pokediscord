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
			.setLabel(channelName == '🏠・𝐈𝐧𝐝𝐢𝐠𝐨-𝐏𝐥𝐚𝐭𝐞𝐚𝐮' ? badgeName : `${badgeName} badge`);
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
	let channelName = '🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);

		const commandEmbed = new EmbedBuilder()
			.setColor('#FFFFFF')
			.setTitle('List of Server Commands')
			.setDescription(
				'**Search for Pokemon**\n' +
					'- `/search` : to search for a Pokemon.\n' +
					'- `/rod` : to fish for a Pokemon with the rod.\n' +
					'- `/super-rod` : to fish for a Pokemon with the super rod.\n' +
					'- `/mega-rod` : to fish for a Pokemon with the mega rod.\n\n' +
					'**Sell Pokemon**\n' +
					'- `/sell [Pokemon name] [max (optional)] [quantity (optional)]` : to sell a Pokemon.\n' +
					'- `/sell-shiny [Pokemon name] [max (optional)] [quantity (optional)]` : to sell a shiny Pokemon.\n\n' +
					'**View Pokemon**\n' +
					"- `/pokedex [trainer name (optional)]` : to view a trainer's Pokedex.\n" +
					"- `/shinydex [trainer name (optional)]` : to view a trainer's shiny Pokedex.\n" +
					'- `/quantity [Pokemon name]` : to view the quantity of a specific Pokemon you own.\n' +
					'- `/quantity-shiny [Pokemon name]` : to view the quantity of a specific shiny Pokemon you own.\n\n' +
					'**Pokemon Evolution**\n' +
					'- `/number-evolution [Pokemon name]` : to see the number of Pokemon required for an evolution.\n' +
					'- `/evolution [Pokemon name] [max (optional)] [quantity (optional)]` : to evolve a Pokemon.\n' +
					'- `/evolution-shiny [Pokemon name] [max (optional)] [quantity (optional)]` : to evolve a shiny Pokemon.\n\n' +
					'**Inventory and Finances**\n' +
					'- `/money` : to view your money.\n' +
					'- `/ball` : to view all your Pokeballs.\n' +
					'- `/price [Pokeball name]` : to see the purchase price of a Pokeball.\n' +
					'- `/price [Pokemon name]` : to see the selling price of a Pokemon.\n' +
					'- `/shop` : to open the shop.\n\n' +
					'**Available Pokemon and Trades**\n' +
					'- `/available` : to see the Pokemon available in the area.\n' +
					'- `/trade [number of Pokemon offered] [Pokemon name offered] [number of Pokemon requested] [Pokemon name requested]` : to trade Pokemon with another player.\n' +
					'- `/zone [Pokemon name]` : to see the zones where a Pokemon appears.\n\n' +
					'**Rune Usage and Purchase**\n' +
					'- `/rune-use [Pokemon name]` : to use a Pokemon rune.\n' +
					'- `/rune-buy [Pokemon name]` : to buy a Pokemon rune.\n' +
					'- `/rune-price [Pokemon name]` : to see the price of a Pokemon rune.\n' +
					'- `/rune-inventory` : to view the Pokemon runes in your possession.\n'
			);

		await channel.send({ embeds: [commandEmbed] });
	} else {
		console.error(`No channel found with the name ${channelName}`);
	}
}

async function globalShopMessage(message) {
	let channelName = '🛒・𝐒𝐡𝐨𝐩';
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
			.setTitle('Welcome, Trainer! Take a look at our Pokeballs!')
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

async function arenaMessages(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐈𝐧𝐝𝐢𝐠𝐨-𝐏𝐥𝐚𝐭𝐞𝐚𝐮',
		'Reglisse',
		'Pokemon Master',
		'I am Reglisse, the Pokemon League Champion. To become a Pokemon Master, you must have all 151 different Pokemon.',
		151,
		151,
		'Pokemon Master'
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐞𝐰𝐭𝐞𝐫-𝐜𝐢𝐭𝐲',
		'Caillou',
		'Boulder',
		'I am Caillou, the Rock-type Gym Leader. To earn the Boulder Badge, you need at least 10 Pokemon, including 5 different ones.',
		10,
		5,
		'1 Badge'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐞𝐫𝐮𝐥𝐞𝐚𝐧-𝐂𝐢𝐭𝐲',
		'Flaquette',
		'Cascade',
		'I am Flaquette, the Water-type Gym Leader. To earn the Cascade Badge, you need at least 33 Pokemon, including 12 different ones.',
		33,
		12,
		'2 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐕𝐞𝐫𝐦𝐢𝐥𝐢𝐨𝐧-𝐂𝐢𝐭𝐲',
		'SergentPile',
		'Thunder',
		'I am Sergent Pile, the Electric-type Gym Leader. To earn the Thunder Badge, you need at least 50 Pokemon, including 20 different ones.',
		50,
		20,
		'3 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐞𝐥𝐚𝐝𝐨𝐧-𝐂𝐢𝐭𝐲',
		'Fleurika',
		'Rainbow',
		'I am Fleurika, the Grass-type Gym Leader. To earn the Rainbow Badge, you need at least 67 Pokemon, including 23 different ones.',
		67,
		23,
		'4 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐅𝐮𝐜𝐡𝐬𝐢𝐚-𝐂𝐢𝐭𝐲',
		'Kouga',
		'Soul',
		'I am Kouga, the Poison-type Gym Leader. To earn the Soul Badge, you need at least 80 Pokemon, including 30 different ones.',
		80,
		30,
		'5 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐒𝐚𝐟𝐟𝐫𝐨𝐧-𝐂𝐢𝐭𝐲',
		'Mordane',
		'Marsh',
		'I am Mordane, the Psychic-type Gym Leader. To earn the Marsh Badge, you need at least 99 Pokemon, including 35 different ones.',
		99,
		35,
		'6 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐂𝐢𝐧𝐧𝐚𝐛𝐚𝐫-𝐈𝐬𝐥𝐚𝐧𝐝',
		'Aoutiste',
		'Volcano',
		'I am Aoutiste, the Fire-type Gym Leader. To earn the Volcano Badge, you need at least 115 Pokemon, including 48 different ones.',
		115,
		48,
		'7 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐕𝐢𝐫𝐢𝐝𝐢𝐚𝐧-𝐂𝐢𝐭𝐲',
		'Giavonnou',
		'Earth',
		'I am Giavonnou, the Ground-type Gym Leader. To earn the Earth Badge, you need at least 150 Pokemon, including 61 different ones.',
		150,
		61,
		'8 Badges'
	);

	sendArenaMessage(
		message,
		'🏠・𝐈𝐧𝐝𝐢𝐠𝐨-𝐏𝐥𝐚𝐭𝐞𝐚𝐮',
		'Shinysse',
		'Shiny Pokemon Master',
		'I am Shinysse, the master of shiny Pokemon. To become a Shiny Pokemon Master, you must have all 151 different shiny Pokemon.',
		151,
		151,
		'Shiny Pokemon Master'
	);
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

export { addBallEmojis, slashCommande, arenaMessages, commandesMessage, globalShopMessage };
