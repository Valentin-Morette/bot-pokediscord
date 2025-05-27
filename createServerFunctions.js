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
					'**Vente de Pokémon**\n' +
					'- `/vendre [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un Pokémon.\n' +
					'- `/vendre-shiny [nom du Pokémon] [max (optionnel)] [quantité (optionnel)]` : pour vendre un Pokémon shiny.\n\n' +
					'**Visualiser les Pokémon**\n' +
					"- `/pokedex [numero de generation (optionnel)][nom du dresseur (optionnel)]` : pour voir le Pokédex d'un dresseur.\n" +
					"- `/shinydex [numero de generation (optionnel)][nom du dresseur (optionnel)]` : pour voir le Shinydex d'un dresseur.\n" +
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
					'**Autres**\n' +
					'- `/code-affiliation` : pour voir votre code d’affiliation.\n' +
					'- `/utiliser-code-affiliation [Code d’affiliation]` : pour utiliser un code d’affiliation. (Vous recevrez 10 000 pokédollars)\n' +
					'- `/premium` : pour devenir membre premium du serveur.\n\n' +
					'**💎 Premium 💎**\n' +
					'- `/pokedex-liste` : pour voir le résumé de tous les Pokédex.\n' +
					'- `/shinydex-liste` : pour voir le résumé de tous les Shinydex.\n' +
					'- `/chance-shiny [nom du Pokémon]` : pour connaître le poucentage de chance d’obtenir un Pokémon shiny.\n'
			);
		await channel.send({ embeds: [commandEmbed] });
	} else {
		console.error(`No channel found with the name ${channelName}`);
	}
}

async function premiumMessage(message) {
	let channelName = '💎・𝐏𝐫𝐞𝐦𝐢𝐮𝐦';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);
		const attachment = new AttachmentBuilder('./assets/premium.png');
		const commandEmbed = new EmbedBuilder()
			.setColor('#3eb0ed')
			.setTitle('💎 Devenez Membre Premium 💎')
			.setDescription(
				`Profitez d'avantages exclusifs en soutenant le serveur !\n\n` +
					`**Avantages Premium :**\n` +
					`- Accès à \`/chance-shiny\`, \`/pokedex-list\` et \`/shinydex-list\`\n` +
					`- Commande \`/cadeau\` toutes les **4h** (au lieu de 12h)\n` +
					`- Plus aucune publicité lors de l'utilisation du bot\n` +
					`- Commandes \`/zone\` et \`/disponible\` enrichies avec les **taux de spawn**\n\n` +
					`Rejoignez les membres les plus engagés et débloquez l'expérience complète du bot.\n\n` +
					`Utilisez la commande \`/premium\` pour devenir Premium !\n\n` +
					`**Prix :** 3,49€ en une fois.`
			)
			.setThumbnail('attachment://premium.png');

		await channel.send({ embeds: [commandEmbed], files: [attachment] });
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
		'Je suis Reglisse, le Champion de la Ligue Pokémon. Pour devenir Maitre Pokémon, vous devez posséder les 151 Pokémon différents de la génération 1.',
		151,
		151,
		'Maitre Pokémon',
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

async function arenaMessagesGen3(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Marc',
		'Maitre Pokémon Gen3',
		'Je suis Marc, le Champion de la Ligue Pokémon. Pour devenir Maitre Pokémon, vous devez posséder les 135 Pokémon différents de la génération 3.',
		100,
		100,
		'Maitre Pokémon Gen3',
		3
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Marcysse',
		'Maitre Pokémon Shiny Gen3',
		'Je suis Marcysse, le maitre des Pokémon shiny. Pour devenir Maitre Pokémon Shiny Gen 3, vous devez posséder les 135 Pokémon shiny différents de la génération 3.',
		135,
		135,
		'Maitre Pokémon Shiny Gen3',
		3
	);
}

async function arenaMessagesGen4(message) {
	await sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Cynthia',
		'Maitre Pokémon Gen4',
		'Je suis Cynthia, la Championne de la Ligue Pokémon. Pour devenir Maitre Pokémon, vous devez posséder les 107 Pokémon différents de la génération 4.',
		107,
		107,
		'Maitre Pokémon Gen4',
		4
	);

	sendArenaMessage(
		message,
		'🏠・𝐏𝐥𝐚𝐭𝐞𝐚𝐮-𝐈𝐧𝐝𝐢𝐠𝐨',
		'Shinthya',
		'Maitre Pokémon Shiny Gen4',
		'Je suis Shinthya, la maitre des Pokémon shiny. Pour devenir Maitre Pokémon Shiny Gen 4, vous devez posséder les 107 Pokémon shiny différents de la génération 4.',
		107,
		107,
		'Maitre Pokémon Shiny Gen4',
		4
	);
}

async function channelZones(message) {
	const response = await API.get(`/zone/4`);
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
	// arenaMessagesGen1,
	// arenaMessagesGen2,
	// arenaMessagesGen3,
	commandesMessage,
	globalShopMessage,
	channelZones,
	premiumMessage,
};
