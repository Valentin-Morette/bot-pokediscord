import {
	slashCommande,
	addBallEmojis,
	arenaMessagesGen1,
	arenaMessagesGen2,
	arenaMessagesGen3,
	arenaMessagesGen4,
	commandesMessage,
	globalShopMessage,
	channelZones,
	channelZonesAsForum,
	premiumMessage,
	reopenArchivedThreads
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
	getBadge,
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
	saveBugIdea
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
import { removeAccents, isUserAdmin, API } from './globalFunctions.js';
import { ChannelType, EmbedBuilder } from 'discord.js';

function pokeChat(client) {
	slashCommande(commandsPokechat);

	client.on('ready', async () => {
		console.log('Pokechat Ready!');
		cron.schedule('0 0 3 * * *', () => {
			client.destroy();
			setTimeout(() => {
				client.login(process.env.TOKEN);
			}, 5000);
		});

		await reopenArchivedThreads(client);

		cron.schedule('*/30 * * * *', async () => {
			await reopenArchivedThreads(client);
		});

		for (const [guildId, guild] of client.guilds.cache) {
			try {
				await guild.emojis.fetch();
			} catch (error) {
				console.warn(`⚠️ Impossible de fetch les emojis pour ${guild.name} :`, error);
			}
		}

		setInterval(async () => {
			console.log('🔄 Vérification des threads pour les nouveaux spawns de Pokémon...');

			for (const [, guild] of client.guilds.cache) {
				await checkAndSpawnPokemon(guild);
			}
		}, 30 * 60 * 1000);
	});

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

	client.on('guildCreate', async (guild) => {
		try {
			await API.post(`/servers`, {
				idServer: guild.id,
				name: guild.name,
				idOwner: guild.ownerId
			});
			await guild.members.fetch();
			addTrainer(guild.members.cache.filter(m => !m.user.bot).map(m => m), guild.id);
			const owner = await guild.members.fetch(guild.ownerId);
			const embed = new EmbedBuilder()
				.setColor('#3eb0ed')
				.setTitle(`Merci d'avoir installé le bot sur ${guild.name} !`)
				.setDescription(
					"Pour terminer l'installation, utilisez la commande `!install` dans un salon de votre serveur (pas en réponse à ce message)."
				)
				.addFields(
					{
						name: 'Ce que fait !install',
						value:
							'- Crée la catégorie `PokeFarm` avec 4 forums (Kanto, Johto, Hoenn, Sinnoh)\n' +
							'- Crée les posts de zones et prépare les spawns\n' +
							"- Configure les permissions nécessaires",
					},
					{
						name: 'Pré‑requis émojis',
						value:
							"- Assurez‑vous d'avoir au moins **4 emplacements d’émojis libres** (pokeball, superball, hyperball, masterball).\n" +
							"- Si nécessaire, vous pourrez (ré)installer les émojis plus tard avec `!addBallEmojis`.",
					},
					{
						name: 'Aide',
						value: '- Tapez `/help` sur le serveur pour voir toutes les commandes.',
					},
					{
						name: 'Informations complémentaires',
						value: "- L'installation prend environ 15 minutes. Le bot fera des pauses lors de la création des forums.\n" +
							"- L'ensemble de l'air de jeu est installé en bas de votre serveur. Le bot ne va donc pas désordonner votre serveur."
					},
				)
				.setFooter({ text: 'Bon jeu !' })

			await owner.send({ embeds: [embed] });
		} catch (error) {
			console.error("Erreur API lors de l'enregistrement :", error.response?.data || error.message);
		}
	});

	client.on('guildDelete', async (guild) => {
		try {
			await API.put(`/servers/${guild.id}`, { isDelete: true });
		} catch (error) {
			console.error("Erreur API lors de la suppression :", error.response?.data || error.message);
		}
	});

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
				console.error(`❌ Impossible de renommer la catégorie "${newChannel.name}" :`, error);
			}
		}
	});


	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		if (isUserAdmin(message.member)) {
			if (message.content === '!install') {
				try {
					await message.reply("🚀 **Début de l'installation...**");

					const emojiResult = await addBallEmojis(message);
					if (!emojiResult) {
						await message.reply("⚠️ **Attention** : Certains emojis n'ont pas pu être créés. L'installation continue...");
					}

					await message.guild.emojis.fetch();

					const forumResult = await channelZonesAsForum(message);
					if (!forumResult) {
						await message.reply("❌ **Installation interrompue** : Échec de la création des forums. Vérifiez les permissions du bot.");
						return;
					}

					await checkAndSpawnPokemon(message.guild);
					await API.put(`/servers/${message.guild.id}`, { isInstal: true });

					await message.reply("🎉 **Installation terminée avec succès !** Le serveur est maintenant configuré pour PokeFarm.");
					console.log(`✅ [INSTALLATION FINALE] Serveur "${message.guild.name}" (${message.guild.id}) - Installation complète réussie`);

				} catch (error) {
					const errorMsg = `💥 **Erreur lors de l'installation** : ${error.message}`;
					await message.reply(errorMsg);
					console.error(`💥 [ERREUR INSTALLATION] Serveur "${message.guild.name}" (${message.guild.id}) - Erreur:`, error.message);
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
					await message.reply(`💥 **Erreur lors de la création des emojis** : ${error.message}`);
					console.error(`💥 [ERREUR EMOJIS] Serveur "${message.guild.name}" (${message.guild.id}) - Erreur:`, error.message);
				}
			}
		}

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!addBallEmojis') {
				await addBallEmojis(message);
			} else if (message.content === '!arenaMessagesGen1') {
				await arenaMessagesGen1(message);
			} else if (message.content === '!arenaMessagesGen2') {
				await arenaMessagesGen2(message);
			} else if (message.content === '!arenaMessagesGen3') {
				await arenaMessagesGen3(message);
			} else if (message.content === '!arenaMessagesGen4') {
				await arenaMessagesGen4(message);
			} else if (message.content === '!updateCmdMessage') {
				await commandesMessage(message);
			} else if (message.content.startsWith('!updateShopMessage')) {
				await globalShopMessage(message);
			} else if (message.content.startsWith('!kick')) {
				await kickMember(message);
			} else if (message.content === '!channelZones') {
				await channelZones(message);
			} else if (message.content === '!channelZonesAsForum') {
				await channelZonesAsForum(message);
			} else if (message.content === '!premiumMessage') {
				await premiumMessage(message);
			}
			return;
		}
	});

	client.on('interactionCreate', async (interaction) => {
		if (!interaction.guild || !interaction.channel) return;

		if (interaction.isCommand()) {
			if (interaction.commandName === 'help') {
				return interaction.reply(await displayHelp(interaction));
			}
		}

		const channel = interaction.channel;
		const parent = channel.parent;

		if (!parent || parent.name !== "PokeFarm") {
			// Vérifie si la catégorie PokeFarm existe
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
			let customId = interaction.customId;
			if (customId.startsWith('pokeball')) {
				handleCatch(interaction, 1);
			} else if (customId.startsWith('hyperball')) {
				handleCatch(interaction, 3);
			} else if (customId.startsWith('superball')) {
				handleCatch(interaction, 2);
			} else if (customId.startsWith('masterball')) {
				handleCatch(interaction, 4);
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
			} else if (customId.startsWith('badge')) {
				const [_, nbPokemon, nbPokemonDiff, badgeName, newRole, generation] = customId.split('|');
				interaction.reply({
					content: await getBadge(interaction, nbPokemon, nbPokemonDiff, badgeName, newRole, generation),
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

			if (interaction.commandName === 'bug') {
				return interaction.reply(await saveBugIdea(interaction, 'bug'));
			}

			if (interaction.commandName === 'idee') {
				return interaction.reply(await saveBugIdea(interaction, 'idea'));
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
