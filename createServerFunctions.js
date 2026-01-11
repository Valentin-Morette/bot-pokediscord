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
	PermissionsBitField,
} from 'discord.js';
import { API, wait, logEvent } from './globalFunctions.js';
import { addTrainer } from './trainerFunctions.js';
import { checkAndSpawnPokemon } from './pokemonFunctions.js';

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
		let emojisCreated = 0;

		for (const pokeball of response.data) {
			try {
				await message.guild.emojis.create({
					name: pokeball.name,
					attachment: './assets/emojis/' + pokeball.name + '.png',
				});
				emojisCreated++;
			} catch (emojiError) {
				await logEvent('ERROR', 'emojis', `Échec création emoji ${pokeball.name}: ${emojiError.message}`, message.guild.id, message.author.id);
			}
		}
		await logEvent('SUCCESS', 'emojis', `${emojisCreated}/${response.data.length} emojis créés`, message.guild.id, message.author.id);
		return emojisCreated > 0;

	} catch (error) {
		await logEvent('ERROR', 'emojis', `Erreur API: ${error.message}`, message.guild.id, message.author.id);
		return false;
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
			'- `/vote` : pour voir le lien de vote pour le bot sur Top.gg.\n' +
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

async function channelZonesAsForum(message) {
	try {
		const needed = new PermissionsBitField([
			PermissionFlagsBits.ManageChannels,
			PermissionFlagsBits.CreatePublicThreads,
			PermissionFlagsBits.SendMessagesInThreads,
			PermissionFlagsBits.ManageThreads,
			PermissionFlagsBits.SendMessages,
		]);

		if (!message.guild.members.me.permissions.has(needed)) {
			await message.reply("❌ Il me manque des permissions : ManageChannels / CreatePublicThreads / SendMessagesInThreads / ManageThreads / SendMessages");
			await logEvent('ERROR', 'installation', `Permissions manquantes pour l'installation: ManageChannels, CreatePublicThreads, SendMessagesInThreads, ManageThreads, SendMessages`, message.guild.id, message.author.id);
			return false;
		}

		const categoryName = 'PokeFarm';

		// Rafraîchir le cache des canaux
		await message.guild.channels.fetch();

		let category = message.guild.channels.cache.find(
			ch => ch.type === ChannelType.GuildCategory && ch.name === categoryName
		);

		if (!category) {
			category = await message.guild.channels.create({
				name: categoryName,
				type: ChannelType.GuildCategory,
				reason: 'Regroupe tous les salons de la zone Pokémon',
			});
			await logEvent('SUCCESS', 'installation', `Catégorie PokeFarm créée`, message.guild.id, message.author.id);
		}

		const allGeneration = {
			1: 'Kanto',
			2: 'Johto',
			3: 'Hoenn',
			4: 'Sinnoh',
		};

		let forumsCreated = 0;
		for (const [generationNumber, generationName] of Object.entries(allGeneration)) {
			try {
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
				let threadsCreated = 0;
				for (const zone of response.data) {
					await forum.threads.create({
						name: '🌳・' + zone,
						message: {
							content: `Bienvenue dans la zone **${zone}** de la génération **${generationName}** !`,
						},
						autoArchiveDuration: 10080,
					});
					threadsCreated++;
					await wait(2500);
				}

				forumsCreated++;
				await logEvent('SUCCESS', 'installation', `Forum ${generationName} créé avec ${threadsCreated} threads`, message.guild.id, message.author.id);

			} catch (forumError) {
				const errorMsg = `❌ **Erreur lors de la création du forum ${generationName}** veuillez signaler le bug avec la commande /bug`;
				await logEvent('ERROR', 'installation', `Erreur lors de la création du forum ${generationName}: ${forumError.message}`, message.guild.id, message.author.id);
				await message.reply(errorMsg);
				return false;
			}
		}
		await logEvent('SUCCESS', 'installation', `${forumsCreated} forums créés avec succès`, message.guild.id, message.author.id);
		await message.reply(`✅ **Installation réussie !** ${forumsCreated}/4 forums créés avec succès dans la catégorie PokeFarm.`);
		return true;
	} catch (error) {
		const errorMsg = `❌ **Erreur critique lors de l'installation** veuillez signaler le bug avec la commande /bug`;
		await logEvent('CRITICAL', 'installation', `Échec critique de l'installation: ${error.message}`, message.guild.id, message.author.id);
		await message.reply(errorMsg);
		return false;
	}
}

async function reopenArchivedThreads(client) {
	// Parcourir TOUS les serveurs où le bot est présent
	for (const [guildId, guild] of client.guilds.cache) {
		try {
			await guild.channels.fetch();
			const forumNames = ['🗺️・kanto', "🗺️・johto", "🗺️・hoenn", "🗺️・sinnoh"];

			const forums = guild.channels.cache.filter(
				(ch) => ch.type === ChannelType.GuildForum && forumNames.includes(ch.name)
			);

			if (forums.size === 0) {
				// Pas de forums pour ce serveur, on continue avec le suivant
				continue;
			}

			for (const forum of forums.values()) {
				try {
					let hasMore = true;
					let before = undefined;

					while (hasMore) {
						const options = { limit: 100 };
						if (before) {
							options.before = before;
						}

						const archived = await forum.threads.fetchArchived(options);

						if (archived.threads.size === 0) {
							hasMore = false;
							break;
						}

						for (const thread of archived.threads.values()) {
							if (!thread.locked) {
								try {
									await thread.setArchived(false);
								} catch (threadErr) {
								}
							}
						}

						// Si on a récupéré moins de threads que la limite, c'est qu'il n'y en a plus
						if (archived.threads.size < 100) {
							hasMore = false;
						} else {
							// Récupérer le dernier thread pour l'utiliser comme point de départ suivant
							const lastThread = Array.from(archived.threads.values()).pop();
							before = lastThread.id;
						}
					}
				} catch (err) {
					await logEvent('ERROR', 'reopenArchivedThreads', `Erreur dans le forum ${forum.name} : ${err.message}`, guild.id, null);
				}
			}
		} catch (err) {
			await logEvent('ERROR', 'reopenArchivedThreads', `Erreur avec le serveur ${guild.name} (${guildId}) : ${err.message}`, guildId, null);
		}
	}
}

async function updateDataServer(client) {
	let totalServers = 0;
	let newServers = 0;
	let errorServers = 0;
	let totalMembers = 0;

	for (const [guildId, guild] of client.guilds.cache) {
		try {
			totalServers++;

			const hasPokefarmCategory = guild.channels.cache.some((ch) => ch.name === 'PokeFarm');

			await API.post(`/servers`, {
				idServer: guild.id,
				name: guild.name,
				idOwner: guild.ownerId,
				hasPokefarmCategory: hasPokefarmCategory
			});

			// Fetch tous les membres et les ajouter
			await guild.members.fetch();
			const members = guild.members.cache.filter(m => !m.user.bot).map(m => m);

			if (members.length > 0) {
				await addTrainer(members, guild.id);
				totalMembers += members.length;
			}

			newServers++;

		} catch (error) {
			errorServers++;
			await logEvent('ERROR', 'updateDataServer', `Erreur pour le serveur ${guild.name} (${guildId}): ${error.message}`, guildId, guild.ownerId);
		}
	}

	return {
		totalServers,
		newServers,
		errorServers,
		totalMembers
	};
}

async function installServer(client, serverId, userId) {
	try {
		const guild = client.guilds.cache.get(serverId);
		if (!guild) {
			return { success: false, error: `Serveur avec l'ID ${serverId} introuvable` };
		}

		await logEvent('INFO', 'installation', `Début de l'installation sur le serveur ${guild.name}`, guild.id, userId);

		// Vérifier les permissions
		const needed = new PermissionsBitField([
			PermissionFlagsBits.ManageChannels,
			PermissionFlagsBits.CreatePublicThreads,
			PermissionFlagsBits.SendMessagesInThreads,
			PermissionFlagsBits.ManageThreads,
			PermissionFlagsBits.SendMessages,
		]);

		if (!guild.members.me.permissions.has(needed)) {
			await logEvent('ERROR', 'installation', `Permissions manquantes pour l'installation`, guild.id, userId);
			return { success: false, error: 'Permissions manquantes : ManageChannels / CreatePublicThreads / SendMessagesInThreads / ManageThreads / SendMessages' };
		}

		// Créer un objet message minimal pour utiliser les fonctions existantes
		const mockMessage = {
			guild: guild,
			client: client,
			author: { id: userId },
			reply: async (content) => {
				// Pour les logs, on peut logger au lieu de répondre
				await logEvent('INFO', 'installation', typeof content === 'string' ? content : 'Installation en cours...', guild.id, userId);
			}
		};

		// Création de la catégorie PokeFarm, des forums et des posts
		const forumResult = await channelZonesAsForum(mockMessage);
		if (!forumResult) {
			await logEvent('ERROR', 'installation', 'Échec de la création des forums', guild.id, userId);
			return { success: false, error: 'Échec de la création des forums. Vérifiez les permissions du bot.' };
		}

		// Création des emojis
		const emojiResult = await addBallEmojis(mockMessage);
		if (!emojiResult) {
			await logEvent('WARN', 'installation', 'Certains emojis n\'ont pas pu être créés', guild.id, userId);
		}
		await guild.emojis.fetch();

		// Création des spawns
		await checkAndSpawnPokemon(guild);

		// Mise à jour de la base de données
		await API.put(`/servers/${guild.id}`, { isInstal: true });

		await logEvent('SUCCESS', 'installation', `Installation complète réussie sur ${guild.name}`, guild.id, userId);
		return { success: true, message: `Installation terminée avec succès sur ${guild.name}` };

	} catch (error) {
		await logEvent('ERROR', 'installation', `Erreur lors de l'installation: ${error.message}`, serverId, userId);
		return { success: false, error: error.message };
	}
}

// Fonction pour réouvrir un thread archivé si nécessaire
async function ensureThreadUnarchived(channel) {
	if (channel && channel.isThread() && channel.archived && !channel.locked) {
		try {
			await channel.setArchived(false);
			await logEvent('INFO', 'threadReopen', `Thread réouvert automatiquement : ${channel.name}`, channel.guild?.id || null, null);
		} catch (error) {
			await logEvent('ERROR', 'threadReopen', `Erreur lors de la réouverture automatique du thread ${channel.name} : ${error.message}`, channel.guild?.id || null, null);
		}
	}
}

function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			// await rest.put(Routes.applicationGuildCommands(process.env.IDAPPLICATION, process.env.IDSERVER), {
			// 	body: commands,
			// });

			await rest.put(Routes.applicationCommands(process.env.IDAPPLICATION), {
				body: commands,
			});
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
	channelZonesAsForum,
	premiumMessage,
	buildCommandEmbed,
	reopenArchivedThreads,
	ensureThreadUnarchived,
	updateDataServer,
	installServer
};
