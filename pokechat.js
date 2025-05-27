import {
	slashCommande,
	addBallEmojis,
	// arenaMessagesGen1,
	// arenaMessagesGen2,
	// arenaMessagesGen3,
	commandesMessage,
	globalShopMessage,
	channelZones,
	premiumMessage,
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
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	evolvePokemon,
	clearOldWildPokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemonWithRune,
	shinyLuck,
} from './pokemonFunctions.js';
import { commandsPokechat, balls, pokemons } from './variables.js';
import { heartbeat, removeAccents } from './globalFunctions.js';

function pokeChat(client) {
	slashCommande(commandsPokechat);

	client.on('ready', () => {
		console.log('Pokechat Ready!');
		heartbeat(client);
		cron.schedule('0 0 3 * * *', () => {
			client.destroy();
			clearOldWildPokemon();
			setTimeout(() => {
				client.login(process.env.TOKEN);
			}, 5000);
		});
	});

	client.on('guildMemberAdd', (member) => {
		addTrainer(member);
		let badgeRole = member.guild.roles.cache.find((role) => role.name === 'Dresseur Pokémon');

		if (badgeRole) {
			member.roles.add(badgeRole).catch(console.error);
		}

		const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === '👋・𝐀𝐜𝐜𝐮𝐞𝐢𝐥');
		if (welcomeChannel) {
			welcomeChannel.send(`Bienvenue ${member} sur le serveur !`);
		}
	});

	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!addBallEmojis') {
				await addBallEmojis(message);
			} else if (message.content === '!arenaMessagesGen1') {
				await arenaMessagesGen1(message);
			} else if (message.content === '!arenaMessagesGen2') {
				await arenaMessagesGen2(message);
			} else if (message.content === '!arenaMessagesGen3') {
				await arenaMessagesGen3(message);
			} else if (message.content === '!updateCmdMessage') {
				await commandesMessage(message);
			} else if (message.content.startsWith('!updateShopMessage')) {
				await globalShopMessage(message);
			} else if (message.content.startsWith('!kick')) {
				await kickMember(message);
			} else if (message.content === '!channelZones') {
				await channelZones(message);
			} else if (message.content === '!premiumMessage') {
				await premiumMessage(message);
			}
			return;
		}
	});

	client.on('interactionCreate', async (interaction) => {
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
				return await findRandomPokemon(interaction);
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

			if (interaction.commandName === 'shinydex') {
				return interaction.reply(await getPokedex(interaction, 'shiny'));
			}

			if (interaction.commandName === 'shinydex-liste') {
				return interaction.reply(await getPokedexList(interaction, 'shiny'));
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
