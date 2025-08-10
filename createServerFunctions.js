import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import {
	EmbedBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ChannelType,
	PermissionFlagsBits,
} from 'discord.js';
import { API, wait } from './globalFunctions.js';

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

function buildCommandEmbed() {
	return new EmbedBuilder()
		.setColor('#FFFFFF')
		.setTitle('Liste des Commandes du Serveur')
		.setDescription(
			'**Recherche de Pokémon**\n' +
			'- `/cherche` : pour chercher un Pokémon.\n\n' +
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
			'- `/cadeau` : pour recevoir un cadeau.\n' +
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
			'- `/bug` : pour signaler un bug.\n' +
			'- `/idee` : pour faire une suggestion.\n' +
			'- `/code-affiliation` : pour voir votre code d’affiliation.\n' +
			'- `/utiliser-code-affiliation [Code d’affiliation]` : pour utiliser un code d’affiliation. (Vous recevrez 10 000 pokédollars)\n' +
			'- `/premium` : pour devenir membre premium du serveur.\n\n' +
			'**💎 Premium 💎**\n' +
			'- `/pokedex-liste` : pour voir le résumé de tous les Pokédex.\n' +
			'- `/shinydex-liste` : pour voir le résumé de tous les Shinydex.\n' +
			'- `/pokedex-inverse [numero de generation (optionnel)]` : pour voir votre Pokédex inversé.\n' +
			'- `/shinydex-inverse [numero de generation (optionnel)]` : pour voir votre Shinydex inversé.\n' +
			'- `/chance-shiny [nom du Pokémon]` : pour connaître le poucentage de chance d’obtenir un Pokémon shiny.\n' +
			'- `/chance-capture [nom du Pokémon]` : pour connaître le pourcentage de chance de capturer un Pokémon par type de Pokéball.\n'
		);
}

async function commandesMessage(message) {
	let channelName = '🧾・𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);

		const commandEmbed = buildCommandEmbed();
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
				`- Accès à \`/chance-shiny\`, \`/chance-capture\`, \`/pokedex-list\`, \`/shinydex-list\`, \`/pokedex-inverse\` et \`/shinydex-inverse\`\n` +
				`- Commande \`/cadeau\` toutes les **4h** (au lieu de 12h)\n` +
				`- Plus aucune publicité lors de l'utilisation du bot\n` +
				`- Commandes \`/zone\` et \`/disponible\` enrichies avec les **taux de spawn**\n\n` +
				`Rejoignez les membres les plus engagés et débloquez l'expérience complète du bot.\n\n` +
				`Utilisez la commande \`/premium\` ou cliquez sur le bouton ci-dessous pour devenir Premium !\n\n` +
				`**Prix :** 3,99€ en une fois.`
			)
			.setThumbnail('attachment://premium.png');

		let row = new ActionRowBuilder();
		const button = new ButtonBuilder()
			.setCustomId('premium')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('💎')
			.setLabel('Devenir Premium');
		row.addComponents(button);

		await channel.send({ embeds: [commandEmbed], files: [attachment], components: [row] });
	} else {
		console.error(`No channel found with the name ${channelName}`);
	}
}

async function globalShopMessage(message) {
	const channelName = '🛒・𝐁𝐨𝐮𝐭𝐢𝐪𝐮𝐞';
	const channel = message.guild.channels.cache.find((ch) => ch.name === channelName);

	if (!channel) {
		console.error(`No channel found with the name ${channelName}`);
		return;
	}

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

	// Boutons d'achat classiques
	const rows = [
		[100, 100, 100, 1],
		[1000, 1000, 1000, 10],
		[10000, 10000, 10000] // sans masterball
	];

	const ballTypes = ['pokeball', 'superball', 'hyperball', 'masterball'];

	for (let line of rows) {
		const row = new ActionRowBuilder();

		for (let i = 0; i < line.length; i++) {
			const quantity = line[i];
			const ball = ballTypes[i];
			if (!ball) continue;
			if (ball === 'masterball' && quantity > 10) continue;

			const emoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(`buy|${quantity}|${ball}`)
				.setStyle(ButtonStyle.Secondary)
				.setLabel(quantity.toString())
				.setEmoji(emoji.id);

			row.addComponents(button);
		}

		await channel.send({ components: [row] });
	}

	const ballEurosPrice = [
		{ type: 'Pokéball', price: 1.99, emoji: pokeballEmoji },
		{ type: 'Superball', price: 2.49, emoji: superballEmoji },
		{ type: 'Hyperball', price: 3.99, emoji: hyperballEmoji },
		{ type: 'Masterball', price: 4.99, emoji: masterballEmoji }
	];

	// Embed payant 💳
	const euroEmbed = new EmbedBuilder()
		.setColor('#FFD700')
		.setTitle('Vous pouvez également payer avec la monnaie de votre monde.')
		.setDescription(
			`${pokeballEmoji} : ` + ballEurosPrice[0].price + ' € les 1000 ' + ballEurosPrice[0].type + '\n\n' +
			`${superballEmoji} : ` + ballEurosPrice[1].price + ' € les 1000 ' + ballEurosPrice[1].type + '\n\n' +
			`${hyperballEmoji} : ` + ballEurosPrice[2].price + ' € les 1000 ' + ballEurosPrice[2].type + '\n\n' +
			`${masterballEmoji} : ` + ballEurosPrice[3].price + ' € les 10 ' + ballEurosPrice[3].type + '\n\n'
		)
		.setThumbnail(`attachment://shop.png`);

	await channel.send({ embeds: [euroEmbed], files: [attachment] });

	// Créer les boutons d'achat avec la monnaie de votre monde
	const row = new ActionRowBuilder();
	for (let i = 0; i < ballTypes.length; i++) {
		const ball = ballTypes[i];
		if (!ball) continue;
		const emoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
		const button = new ButtonBuilder()
			.setCustomId(`ball|${ball}`)
			.setStyle(ButtonStyle.Secondary)
			.setLabel((ballEurosPrice[i].type !== "Masterball" ? 1000 : 10) + ' (' + ballEurosPrice[i].price + '€)')
			.setEmoji(emoji.id);

		row.addComponents(button);
	}
	await channel.send({ components: [row] });
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

async function channelZonesAsForum(message) {
	const categoryName = 'PokeFarm';

	let category = message.guild.channels.cache.find(
		ch => ch.type === ChannelType.GuildCategory && ch.name === categoryName
	);

	if (!category) {
		category = await message.guild.channels.create({
			name: categoryName,
			type: ChannelType.GuildCategory,
			reason: 'Regroupe tous les salons de la zone Pokémon',
		});
	}

	const allGeneration = {
		1: 'Kanto',
		2: 'Johto',
		3: 'Hoenn',
		4: 'Sinnoh',
	};

	for (const [generationNumber, generationName] of Object.entries(allGeneration)) {
		const forum = await message.guild.channels.create({
			name: `🗺️・${generationName}`,
			type: ChannelType.GuildForum,
			parent: category.id,
			topic: `Chaque post est une zone avec des Pokémon différents.\nCliquez sur les boutons sous les Pokémon pour tenter de les capturer.\nGérez vos Poké Balls et votre argent avec soin.\nUtilisez la commande /help pour voir toutes les commandes disponibles.`,
			permissionOverwrites: [
				{
					id: message.guild.roles.everyone.id,
					deny: [PermissionFlagsBits.SendMessages],
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.ReadMessageHistory,
						PermissionFlagsBits.SendMessagesInThreads,
						PermissionFlagsBits.AddReactions,
					],
				},
				{
					id: message.client.user.id,
					allow: [
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.ReadMessageHistory,
						PermissionFlagsBits.SendMessages,
						PermissionFlagsBits.SendMessagesInThreads,
						PermissionFlagsBits.ManageThreads,
						PermissionFlagsBits.ManageChannels,
					],
				}
			],
			reason: `Forum de discussion pour ${generationName}`,
		});

		// Créer les posts (threads) par le bot seulement
		const response = await API.get(`/zone/${generationNumber}`);
		for (const zone of response.data) {
			await forum.threads.create({
				name: '🌳・' + zone,
				message: {
					content: `Bienvenue dans la zone **${zone}** de la génération **${generationName}** !`,
				},
				autoArchiveDuration: 10080,
			});
			await wait(2500);
		}
	}
}

async function reopenArchivedThreads(client) {
	const guild = client.guilds.cache.get(process.env.IDSERVER);
	if (!guild) return console.log("❌ Serveur introuvable");

	await guild.channels.fetch();
	const forumNames = ['🗺️・kanto', "🗺️・johto", "🗺️・hoenn", "🗺️・sinnoh"];

	const forums = guild.channels.cache.filter(
		(ch) => ch.type === ChannelType.GuildForum && forumNames.includes(ch.name)
	);

	for (const forum of forums.values()) {
		try {
			const archived = await forum.threads.fetchArchived();
			for (const thread of archived.threads.values()) {
				if (!thread.locked) {
					await thread.setArchived(false);
					console.log(`♻️ Thread rouvert : ${thread.name}`);
				}
			}
		} catch (err) {
			console.error(`❌ Erreur dans le forum ${forum.name} :`, err.message);
		}
	}
}


function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log('Starting slash commands registration.');

			// await rest.put(Routes.applicationGuildCommands(process.env.IDAPPLICATION, process.env.IDSERVER), {
			// 	body: commands,
			// });

			await rest.put(Routes.applicationCommands(process.env.IDAPPLICATION), {
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
	commandesMessage,
	globalShopMessage,
	sendArenaMessage,
	slashCommande,
	arenaMessagesGen1,
	arenaMessagesGen2,
	arenaMessagesGen3,
	arenaMessagesGen4,
	channelZones,
	channelZonesAsForum,
	premiumMessage,
	buildCommandEmbed,
	reopenArchivedThreads
};
