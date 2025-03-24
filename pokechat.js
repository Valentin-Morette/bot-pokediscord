import {
	slashCommande,
	addBallEmojis,
	arenaMessagesGen1,
	arenaMessagesGen2,
	arenaMessagesGen3,
	commandesMessage,
	globalShopMessage,
	channelZones,
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
	getPrice,
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
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	evolvePokemon,
	clearOldWildPokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemonWithRune,
} from './pokemonFunctions.js';
import { commandsPokechat, balls, pokemons } from './variables.js';
import { heartbeat, createListEmbed } from './globalFunctions.js';

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
		let badgeRole = member.guild.roles.cache.find((role) => role.name === '0 Badge');

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
				await findRandomPokemon(interaction, 'herbe');
				return;
			}

			if (interaction.commandName === 'mega-canne') {
				await findRandomPokemon(interaction, 'megaCanne');
				return;
			}

			if (interaction.commandName === 'canne') {
				await findRandomPokemon(interaction, 'canne');
				return;
			}

			if (interaction.commandName === 'super-canne') {
				await findRandomPokemon(interaction, 'superCanne');
				return;
			}

			if (interaction.commandName === 'argent') {
				interaction.reply(await getMoney(interaction.user.id));
				return;
			}

			if (interaction.commandName === 'cadeau') {
				interaction.reply(await dailyGift(interaction));
				return;
			}

			if (interaction.commandName === 'quantite') {
				interaction.reply(await quantityPokemon(interaction));
				return;
			}

			if (interaction.commandName === 'quantite-shiny') {
				interaction.reply(await quantityPokemon(interaction, true));
				return;
			}

			if (interaction.commandName === 'disponible') {
				const channelName = client.channels.cache.get(interaction.channelId).name;
				interaction.reply(await getAvailable(channelName));
				return;
			}

			if (interaction.commandName === 'zone') {
				interaction.reply(await getZoneForPokemon(interaction.options.getString('nom')));
				return;
			}

			if (interaction.commandName === 'pokedex') {
				interaction.reply(await getPokedex(interaction, 'regular'));
				return;
			}

			if (interaction.commandName === 'pokedex-liste') {
				interaction.reply(await getPokedexList(interaction, 'regular'));
				return;
			}

			if (interaction.commandName === 'shinydex') {
				interaction.reply(await getPokedex(interaction, 'shiny'));
				return;
			}

			if (interaction.commandName === 'shinydex-liste') {
				interaction.reply(await getPokedexList(interaction, 'shiny'));
				return;
			}

			if (interaction.commandName === 'boutique') {
				interaction.reply(await shopMessage(interaction, true));
				return;
			}

			if (interaction.commandName === 'ball') {
				interaction.reply(await getBallTrainer(interaction));
				return;
			}

			if (interaction.commandName === 'evolution' || interaction.commandName === 'evolution-shiny') {
				const isShiny = interaction.commandName === 'evolution-shiny';
				interaction.reply(
					await evolvePokemon(
						interaction.user.id,
						interaction.options.getString('nom'),
						interaction.channel.name,
						interaction.options.getInteger('quantite'),
						isShiny,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'vendre' || interaction.commandName === 'vendre-shiny') {
				const isShiny = interaction.commandName === 'vendre-shiny';
				interaction.reply(
					await sellPokemon(
						interaction.user.id,
						interaction.options.getString('nom'),
						interaction.options.getInteger('quantite'),
						isShiny,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'prix') {
				interaction.reply(await getPrice(interaction.options.getString('nom')));
				return;
			}

			if (interaction.commandName === 'rune-utiliser') {
				interaction.reply(await spawnPokemonWithRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-acheter') {
				interaction.reply(await buyRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-inventaire') {
				interaction.reply(await checkRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-prix') {
				interaction.reply(await pricePokemon(interaction.options.getString('nom'), true));
				return;
			}

			if (interaction.commandName === 'nombre-evolution') {
				interaction.reply(await nbPokemon(interaction.options.getString('nom')));
				return;
			}

			if (interaction.commandName === 'echange') {
				interaction.reply(await purposeSwapPokemon(interaction));
				return;
			}

			if (interaction.commandName === 'code-affiliation') {
				interaction.reply(await getAffiliateCode(interaction.user.id));
				return;
			}

			if (interaction.commandName === 'utiliser-code-affiliation') {
				interaction.reply(
					await useAffiliateCode(interaction.user.id, interaction.options.getString('code'))
				);
				return;
			}
		}

		// Autocomplete interaction
		if (interaction.isAutocomplete()) {
			const focusedOption = interaction.options.getFocused(true);

			if (focusedOption.value === '') {
				return;
			}

			const name = focusedOption.name;
			if (name === 'nom' || name === 'nom_pokemon_demande' || name === 'nom_pokemon_propose') {
				const filtered = pokemons.filter((pokemon) =>
					pokemon.toLowerCase().startsWith(focusedOption.value.toLowerCase())
				);

				await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
			}
			return;
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
