import {
	slashCommande,
	addBallEmojis,
	commandesMessage,
	globalShopMessage,
	channelZonesAsForum,
	premiumMessage,
	reopenArchivedThreads,
	ensureThreadUnarchived,
	updateDataServer,
	installServer,
	bulkServerTrainer
} from './createServerFunctions.js';
import cron from 'node-cron';
import {
	addTrainer,
	getBallTrainer,
	sellPokemon,
	getPokedex,
	getPokedexList,
	getMoney,
	getAffiliateCode,
	useAffiliateCode,
	buyBall,
	handleCatch,
	purposeSwapPokemon,
	acceptSwapPokemon,
	buyRune,
	checkRune,
	pricePokemon,
	kickMember,
	shopMessage,
	quantityPokemon,
	dailyGift,
	premiumDisplay,
	welcomeTrainer,
	premiumUrl,
	buyBalls,
	displayHelp,
	saveBugIdea,
	displayVoteLink,
	sendInstallationMessage,
	cleanupInactiveUsers
} from './trainerFunctions.js';
import {
	spawnRandomPokemon,
	evolvePokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemonWithRune,
	shinyLuck,
	catchLuck,
	checkAndSpawnPokemon
} from './pokemonFunctions.js';
import { commandsPokechat, balls, pokemons } from './variables.js';
import {
	removeAccents,
	isUserAdmin,
	findParentCategory,
	logEvent,
	API,
	sendToConsoleChannel
} from './globalFunctions.js';
import { extractFirstNameFromMessage } from './usersFunctions.js';
import { ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

process.env.TZ = 'Europe/Paris';

function pokeChat(client) {
	slashCommande(commandsPokechat);
	client.on('ready', async () => {
		console.log('Pokechat Ready!');

		// Cron pour redémarrer le bot - tous les jours à 3h00
		cron.schedule('0 0 3 * * *', () => {
			client.destroy();
			setTimeout(() => {
				client.login(process.env.TOKEN);
			}, 5000);
		});

		// Cron pour réouvrir les threads archivés - tous les jours à 2h00
		cron.schedule('0 2 * * *', async () => {
			await reopenArchivedThreads(client);
		});

		// Cron pour reset des streaks Top.gg - tous les jours à minuit
		cron.schedule('0 0 * * *', async () => {
			try {
				const response = await API.post('/topgg/reset-streaks');
				await logEvent('SUCCESS', 'topgg', `Streaks Top.gg reset avec succès: ${response.data.resetCount} resetées sur ${response.data.totalTrainers} dresseurs en streak`, null, null);
			} catch (error) {
				await logEvent('ERROR', 'topgg', `Erreur lors du reset des streaks: ${error.message}`, null, null);
			}
		});

		// Cron pour nettoyage des utilisateurs inactifs - tous les jours à 4h00
		cron.schedule('0 4 * * *', async () => {
			await cleanupInactiveUsers(client);
		});

		for (const [guildId, guild] of client.guilds.cache) {
			try {
				await guild.emojis.fetch();
			} catch (error) {
				console.warn(`⚠️ Impossible de fetch les emojis pour ${guild.name} :`, error);
			}
		}

		await reopenArchivedThreads(client);

		setInterval(async () => {
			for (const [, guild] of client.guilds.cache) {
				await checkAndSpawnPokemon(guild);
			}
		}, 30 * 60 * 1000);
	});

	// Event qui se déclenche lorsqu'un membre rejoint un serveur
	client.on('guildMemberAdd', (member) => {
		addTrainer(member, member.guild.id);
		// Only serv perso
		if (member.guild.id == process.env.IDSERVER) {
			let badgeRole = member.guild.roles.cache.find((role) => role.name === 'Dresseur Pokémon');

			if (badgeRole) {
				member.roles.add(badgeRole).catch(console.error);
			}

			const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === '👋・𝐀𝐜𝐜𝐮𝐞𝐢𝐥');
			if (welcomeChannel) {
				welcomeChannel.send(welcomeTrainer(member));
			}
		}
	});

	// Event qui se déclenche lorsqu'un membre quitte un serveur
	client.on('guildMemberRemove', async (member) => {
		try {
			if (member.user.bot) {
				return;
			}

			await API.put('/server-trainer/leave', {
				idTrainer: member.user.id,
				idServer: member.guild.id
			});
		} catch (error) {
			await logEvent('ERROR', 'guildMemberRemove', `Erreur lors de l'appel API pour le départ de ${member.user.tag} (${member.user.id}): ${error.response?.data || error.message}`, member.guild.id, member.user.id);
		}
	});

	// Event qui se déclenche lorsqu'un serveur ajoute le bot
	client.on('guildCreate', async (guild) => {
		try {
			const hasPokefarmCategory = guild.channels.cache.some((ch) => ch.name === 'PokeFarm');
			await API.post(`/servers`, {
				idServer: guild.id,
				name: guild.name,
				idOwner: guild.ownerId,
				hasPokefarmCategory: hasPokefarmCategory
			});
			await guild.members.fetch();
			addTrainer(guild.members.cache.filter(m => !m.user.bot).map(m => m), guild.id);
			const owner = await guild.members.fetch(guild.ownerId);
			await sendInstallationMessage(guild, owner);

			// Envoyer une notification dans le channel console
			await sendToConsoleChannel(
				client,
				'info',
				'🆕 Nouveau serveur',
				`Le bot a été ajouté sur le serveur **${guild.name}**`,
				{
					serverId: guild.id,
					userId: guild.ownerId,
					userName: owner?.user?.tag || 'Inconnu'
				}
			);
		} catch (error) {
			await logEvent('ERROR', 'installation', `Erreur API lors de l'enregistrement du serveur: ${error.response?.data || error.message}`, guild.id, guild.ownerId);
		}
	});

	// Event qui se déclenche lorsqu'un serveur supprime le bot
	client.on('guildDelete', async (guild) => {
		try {
			await API.put(`/servers/${guild.id}`, { isDelete: true });

			// Envoyer une notification dans le channel console
			await sendToConsoleChannel(
				client,
				'info',
				'❌ Serveur supprimé',
				`Le bot a été retiré du serveur **${guild.name}**`,
				{
					serverId: guild.id,
					userId: guild.ownerId
				}
			);
		} catch (error) {
			await logEvent('ERROR', 'installation', `Erreur API lors de la suppression du serveur: ${error.response?.data || error.message}`, guild.id, guild.ownerId);
		}
	});

	// Event qui se déclenche lorsqu'un canal est renommé
	client.on('channelUpdate', async (oldChannel, newChannel) => {
		// Vérifie que c'est bien une catégorie renommée
		if (
			oldChannel.type === ChannelType.GuildCategory &&
			newChannel.type === ChannelType.GuildCategory &&
			oldChannel.name === 'PokeFarm' &&
			newChannel.name !== 'PokeFarm'
		) {
			try {
				await newChannel.setName('PokeFarm');
			} catch (error) {
				await logEvent('ERROR', 'installation', `Impossible de renommer la catégorie "${newChannel.name}": ${error.message}`, newChannel.guild.id, newChannel.guild.ownerId);
			}
		}
	});


	// Event qui se déclenche lorsqu'un message est envoyé
	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		// Prénom détecté uniquement via des formulations explicites (voir usersFunctions.js)
		const nameMatch = extractFirstNameFromMessage(message.content);
		if (nameMatch) {
			await API.put(`/users/${message.author.id}`, {
				data: { firstName: nameMatch }
			});
		}

		if (isUserAdmin(message.member)) {
			if (message.content === '!install') {
				try {
					await message.reply("🚀 **Début de l'installation... ce processus peut prendre jusqu'à 15 minutes**");

					// Création de la catégorie PokeFarm, des forums et des posts
					const forumResult = await channelZonesAsForum(message);
					if (!forumResult) {
						await message.reply("❌ **Installation interrompue** : Échec de la création des forums. Vérifiez les permissions du bot.");
						return;
					}

					// Création des emojis
					const emojiResult = await addBallEmojis(message);
					if (!emojiResult) {
						await message.reply("⚠️ **Attention** : Certains emojis n'ont pas pu être créés. L'installation continue...");
					}
					await message.guild.emojis.fetch();

					// Création des spawns
					await checkAndSpawnPokemon(message.guild);

					// Mise à jour de la base de données
					await API.put(`/servers/${message.guild.id}`, { isInstal: true });

					await logEvent('SUCCESS', 'installation', `Installation complète réussie`, message.guild.id, message.author.id);
					await message.reply("🎉 **Installation terminée avec succès !** Le serveur est maintenant configuré pour PokeFarm.");

				} catch (error) {
					const errorMsg = `💥 **Erreur lors de l'installation** : ${error.message}`;
					await logEvent('ERROR', 'installation', `Erreur lors de l'installation: ${error.message}`, message.guild.id, message.author.id);
					await message.reply(errorMsg);
				}
			} else if (message.content === '!addBallEmojis') {
				try {
					await message.reply("🎨 **Création des emojis en cours...**");
					const result = await addBallEmojis(message);
					if (result) {
						await message.reply("✅ **Emojis créés avec succès !**");
					} else {
						await message.reply("❌ **Échec de la création des emojis.** Vérifiez les permissions du bot.");
					}
				} catch (error) {
					await logEvent('ERROR', 'emojis', `Erreur lors de la création des emojis: ${error.message}`, message.guild.id, message.author.id);
					await message.reply(`💥 **Erreur lors de la création des emojis** : ${error.message}`);
				}
			}
		}

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!addBallEmojis') {
				await addBallEmojis(message);
			} else if (message.content === '!updateCmdMessage') {
				await commandesMessage(message);
			} else if (message.content.startsWith('!updateShopMessage')) {
				await globalShopMessage(message);
			} else if (message.content.startsWith('!kick')) {
				await kickMember(message);
			} else if (message.content === '!channelZonesAsForum') {
				await channelZonesAsForum(message);
			} else if (message.content === '!premiumMessage') {
				await premiumMessage(message);
			} else if (message.content === '!updateDataServer') {
				await message.reply('🔄 Début de la synchronisation des serveurs manquants...');
				const result = await updateDataServer(client);
				await message.reply(`✅ Synchronisation terminée !\n📊 **Résultats :**\n• ${result.newServers} serveurs traités\n• ${result.totalMembers} membres ajoutés\n• ${result.errorServers} erreurs\n• ${result.totalServers} serveurs au total`);
			} else if (message.content === '!cleanupUsers') {
				await message.reply('🧹 Début du nettoyage des utilisateurs inactifs...');
				const result = await cleanupInactiveUsers(client);
				if (result.success) {
					await message.reply(`✅ Nettoyage terminé !\n📊 **Résultats :**\n• ${result.activeUsers} utilisateurs actifs\n• ${result.totalServers} serveurs analysés`);
				} else {
					await message.reply(`❌ Erreur lors du nettoyage : ${result.error}`);
				}
			} else if (message.content.startsWith('!installServer')) {
				const serverId = message.content.split(' ')[1];
				if (!serverId) {
					await message.reply('❌ Veuillez fournir un serverId. Usage: `!installServer <serverId>`');
					return;
				}
				await message.reply(`🚀 Début de l'installation sur le serveur ${serverId}...`);
				const result = await installServer(client, serverId, message.author.id);
				if (result.success) {
					await message.reply(`✅ ${result.message}`);
				} else {
					await message.reply(`❌ Erreur lors de l'installation : ${result.error}`);
				}
			} else if (message.content === '!server_trainer') {
				await message.reply('🔄 Début de la synchronisation bulk des serveurs-trainers...');
				const result = await bulkServerTrainer(client);
				if (result.success) {
					await message.reply(`✅ Synchronisation bulk terminée !\n📊 **Résultats :**\n• ${result.totalRows} associations créées\n• ${result.totalServers} serveurs traités\n• ${result.totalMembers} membres synchronisés`);
				} else {
					await message.reply(`❌ Erreur lors de la synchronisation bulk : ${result.error}`);
				}
			}
			return;
		}
	});

	// Event qui se déclenche lorsqu'une interaction est créée (commande, bouton, autocomplete)
	client.on('interactionCreate', async (interaction) => {

		// Boutons dans les DMs
		if (interaction.isButton()) {
			let customId = interaction.customId;
			if (customId.startsWith('sell_vote_')) {
				// Format: sell_vote_${pokemonName}_${userId}_${isShiny ? 1 : 0}
				const args = customId.split('_');
				if (args.length >= 5) {
					const pokemonName = args[2];
					const userId = args[3];
					const isShiny = args[4] === '1';

					// Désactiver le bouton
					const disabledButton = new ButtonBuilder()
						.setCustomId(customId)
						.setLabel('Vendre')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true);

					const row = new ActionRowBuilder().addComponents(disabledButton);

					// Mettre à jour le message avec le bouton désactivé
					await interaction.update({
						components: [row],
					});

					// Vendre le pokemon et répondre
					const result = await sellPokemon(interaction.user.id, pokemonName, 1, isShiny, false);
					await interaction.followUp({
						content: result,
						ephemeral: true,
					});
				}
			}
		}

		if ((!interaction.guild || !interaction.channel) && !interaction.isCommand() && !interaction.isButton() && !interaction.isAutocomplete()) {
			return;
		}

		// Limite utilisation de la commande dans la catégorie PokeFarm
		const channel = interaction.channel;
		const parentCategory = findParentCategory(channel);
		if (!parentCategory || parentCategory.name !== "PokeFarm") {
			const category = interaction.guild.channels.cache.find(c => c.name === 'PokeFarm');
			if (!category) {
				if (isUserAdmin(interaction.member)) {
					await interaction.reply({
						content: "La catégorie `PokeFarm` n'existe pas. Veuillez créer la catégorie avec la commande `!install`.",
						ephemeral: true
					});
					return;
				} else {
					await interaction.reply({
						content: "Cette commande ne peut être utilisée que dans la catégorie `PokeFarm`. Veuillez contacter un administrateur pour qu'il crée la catégorie avec la commande `!install`.",
						ephemeral: true
					});
					return;
				}
			}

			await interaction.reply({
				content: "Cette commande ne peut être utilisée que dans la catégorie `PokeFarm`.",
				ephemeral: true
			});
			return;
		}

		// Button interaction
		if (interaction.isButton()) {
			await ensureThreadUnarchived(interaction.channel);

			let customId = interaction.customId;
			if (customId.startsWith('pokeball')) {
				handleCatch(interaction, 1);
				return;
			} else if (customId.startsWith('hyperball')) {
				handleCatch(interaction, 3);
				return;
			} else if (customId.startsWith('superball')) {
				handleCatch(interaction, 2);
				return;
			} else if (customId.startsWith('masterball')) {
				handleCatch(interaction, 4);
				return;
			} else if (customId.startsWith('buy')) {
				const args = customId.split('|');
				let numberBall = args[1];
				let nameBall = args[2];
				interaction.reply({
					content: await buyBall(
						interaction.user.id,
						balls.find((ball) => ball.name === nameBall).id,
						numberBall,
						nameBall
					),
					ephemeral: true,
				});
			} else if (customId.startsWith('trade')) {
				const args = customId.split('|');
				const idTrade = args[1];
				const responseMessage = await acceptSwapPokemon(idTrade, interaction);

				if (responseMessage) {
					await interaction.reply(responseMessage);
				} else {
					await interaction.followUp(`The trade was successfully completed.`);
				}
			} else if (customId.startsWith('premium')) {
				let url = await premiumUrl(interaction.user.id, interaction.guild.id);
				if (url != null) {
					interaction.reply({
						content: `Pour devenir Premium, veuillez visiter ce lien : [Lien Premium](${url})`,
						ephemeral: true,
					});
				} else {
					interaction.reply({
						content: `Vous êtes déjà Premium, merci pour votre soutien !`,
						ephemeral: true,
					});
				}
			} else if (customId.startsWith('ball')) {
				const args = customId.split('|');
				const ballName = args[1];
				let url = await buyBalls(
					interaction.user.id,
					ballName,
				);
				if (url != null) {
					interaction.reply({
						content: `Pour acheter des ${ballName}, veuillez visiter ce lien : [Lien Boutique](${url})`,
						ephemeral: true,
					});
				}
			}
			return;
		}

		// Command interaction
		if (interaction.isCommand()) {
			if (interaction.channel.name === '👋・𝐀𝐜𝐜𝐮𝐞𝐢𝐥') {
				interaction.reply({
					content: `Vous ne pouvez pas utiliser de commandes dans le canal d'accueil.`,
					ephemeral: true,
				});
				return;
			}

			if (interaction.commandName === 'help') {
				return interaction.reply(await displayHelp(interaction));
			}

			if (interaction.commandName === 'bug') {
				return interaction.reply(await saveBugIdea(interaction, 'bug'));
			}

			if (interaction.commandName === 'idee') {
				return interaction.reply(await saveBugIdea(interaction, 'idea'));
			}

			if (interaction.commandName === 'vote') {
				return interaction.reply(await displayVoteLink());
			}

			if (interaction.commandName === 'cherche') {
				return await spawnRandomPokemon(interaction);
			}

			if (interaction.commandName === 'argent') {
				return interaction.reply(await getMoney(interaction.user.id));
			}

			if (interaction.commandName === 'cadeau') {
				return interaction.reply(await dailyGift(interaction));
			}

			if (interaction.commandName === 'quantite') {
				return interaction.reply(await quantityPokemon(interaction));
			}

			if (interaction.commandName === 'quantite-shiny') {
				return interaction.reply(await quantityPokemon(interaction, true));
			}

			if (interaction.commandName === 'disponible') {
				const channelName = client.channels.cache.get(interaction.channelId).name;
				return interaction.reply(await getAvailable(interaction, channelName));
			}

			if (interaction.commandName === 'zone') {
				return interaction.reply(
					await getZoneForPokemon(interaction.user.id, interaction.options.getString('nom'))
				);
			}

			if (interaction.commandName === 'pokedex') {
				return interaction.reply(await getPokedex(interaction, 'regular'));
			}

			if (interaction.commandName === 'pokedex-liste') {
				return interaction.reply(await getPokedexList(interaction, 'regular'));
			}

			if (interaction.commandName === 'pokedex-inverse') {
				return interaction.reply(await getPokedex(interaction, 'regular-reverse'));
			}

			if (interaction.commandName === 'shinydex') {
				return interaction.reply(await getPokedex(interaction, 'shiny'));
			}

			if (interaction.commandName === 'shinydex-liste') {
				return interaction.reply(await getPokedexList(interaction, 'shiny'));
			}

			if (interaction.commandName === 'shinydex-inverse') {
				return interaction.reply(await getPokedex(interaction, 'shiny-reverse'));
			}

			if (interaction.commandName === 'boutique') {
				return interaction.reply(await shopMessage(interaction, true));
			}

			if (interaction.commandName === 'ball') {
				return interaction.reply(await getBallTrainer(interaction));
			}

			if (interaction.commandName === 'evolution' || interaction.commandName === 'evolution-shiny') {
				const isShiny = interaction.commandName === 'evolution-shiny';
				return interaction.reply(
					await evolvePokemon(
						interaction.user.id,
						interaction.options.getString('nom'),
						interaction.channel.name,
						interaction.options.getInteger('quantite'),
						isShiny,
						interaction.options.getString('max') === 'true'
					)
				);
			}

			if (interaction.commandName === 'vendre' || interaction.commandName === 'vendre-shiny') {
				const isShiny = interaction.commandName === 'vendre-shiny';
				return interaction.reply(
					await sellPokemon(
						interaction.user.id,
						interaction.options.getString('nom'),
						interaction.options.getInteger('quantite'),
						isShiny,
						interaction.options.getString('max') === 'true'
					)
				);
			}

			if (interaction.commandName === 'chance-shiny') {
				return interaction.reply(
					await shinyLuck(interaction.user.id, interaction.options.getString('nom'))
				);
			}

			if (interaction.commandName === 'chance-capture') {
				return interaction.reply(await catchLuck(interaction));
			}

			if (interaction.commandName === 'prix') {
				return interaction.reply(await pricePokemon(interaction.options.getString('nom')));
			}

			if (interaction.commandName === 'rune-utiliser') {
				return interaction.reply(await spawnPokemonWithRune(interaction));
			}

			if (interaction.commandName === 'rune-acheter') {
				return interaction.reply(await buyRune(interaction));
			}

			if (interaction.commandName === 'rune-inventaire') {
				return interaction.reply(await checkRune(interaction));
			}

			if (interaction.commandName === 'rune-prix') {
				return interaction.reply(await pricePokemon(interaction.options.getString('nom'), true));
			}

			if (interaction.commandName === 'nombre-evolution') {
				return interaction.reply(await nbPokemon(interaction.options.getString('nom')));
			}

			if (interaction.commandName === 'echange') {
				return interaction.reply(await purposeSwapPokemon(interaction));
			}

			if (interaction.commandName === 'premium') {
				return interaction.reply(await premiumDisplay(interaction.user.id));
			}

			if (interaction.commandName === 'code-affiliation') {
				return interaction.reply(await getAffiliateCode(interaction.user.id));
			}

			if (interaction.commandName === 'utiliser-code-affiliation') {
				return interaction.reply(
					await useAffiliateCode(interaction.user.id, interaction.options.getString('code'))
				);
			}
		}

		// Autocomplete interaction
		if (interaction.isAutocomplete()) {
			const focusedOption = interaction.options.getFocused(true);
			const value = removeAccents(focusedOption.value.toLowerCase());

			if (!value) return;

			const name = focusedOption.name;
			if (['nom', 'nom_pokemon_demande', 'nom_pokemon_propose'].includes(name)) {
				const filtered = pokemons
					.filter((pokemon) => removeAccents(pokemon.toLowerCase()).startsWith(value))
					.slice(0, 25);

				await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
			}
			return;
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
