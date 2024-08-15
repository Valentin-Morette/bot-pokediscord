import {
	slashCommande,
	addBallEmojis,
	arenaMessages,
	commandesMessage,
	globalShopMessage,
} from './createServerFunctions.js';
import cron from 'node-cron';
import {
	addTrainer,
	getBallTrainer,
	sellPokemon,
	getPokedex,
	getMoney,
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

		const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === '👋・𝐖𝐞𝐥𝐜𝐨𝐦𝐞');
		if (welcomeChannel) {
			welcomeChannel.send(`Welcome ${member} to the server!`);
		}

		const route1Channel = member.guild.channels.cache.find((ch) => ch.name === '🌳・Route-1');

		const title = `Welcome to the server!`;
		const description =
			`The goal of this server is to catch all Pokemon.\n` +
			`Each channel corresponds to a capture area in the game, and each area has different Pokemon.\n` +
			`To try to catch a Pokemon, you need to type **\`${'/search'}\`** in a channel (Example: <#${
				route1Channel.id
			}>).`;
		const footer = 'Tutorial - 1/2';
		const thumbnailUrl = member.user.displayAvatarURL();

		const embed = createListEmbed(description, title, footer, thumbnailUrl, null, '#0099ff');

		member.send({ embeds: [embed] });
	});

	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!addBallEmojis') {
				await addBallEmojis(message);
			} else if (message.content === '!arenaMessages') {
				await arenaMessages(message);
			} else if (message.content === '!updateCmdMessage') {
				await commandesMessage(message);
			} else if (message.content.startsWith('!updateShopMessage')) {
				await globalShopMessage(message);
			} else if (message.content.startsWith('!kick')) {
				await kickMember(message);
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
				await interaction.deferUpdate();
				interaction.user.send(
					await buyBall(
						interaction.user.id,
						balls.find((ball) => ball.name === nameBall).id,
						numberBall,
						nameBall
					)
				);
			} else if (customId.startsWith('badge')) {
				const [_, nbPokemon, nbPokemonDiff, badgeName, newRole] = customId.split('|');
				await interaction.deferUpdate();
				interaction.user.send(await getBadge(interaction, nbPokemon, nbPokemonDiff, badgeName, newRole));
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
			if (interaction.channel.name === '👋・𝐖𝐞𝐥𝐜𝐨𝐦𝐞') {
				interaction.reply(`You cannot use commands in the welcome channel.`);
				return;
			}

			if (interaction.commandName === 'search') {
				interaction.reply(await findRandomPokemon(interaction, 'herbe'));
				return;
			}

			if (interaction.commandName === 'mega-rod') {
				interaction.reply(await findRandomPokemon(interaction, 'megaCanne'));
				return;
			}

			if (interaction.commandName === 'rod') {
				interaction.reply(await findRandomPokemon(interaction, 'canne'));
				return;
			}

			if (interaction.commandName === 'super-rod') {
				interaction.reply(await findRandomPokemon(interaction, 'superCanne'));
				return;
			}

			if (interaction.commandName === 'money') {
				interaction.reply(await getMoney(interaction.user.id));
				return;
			}

			if (interaction.commandName === 'quantity') {
				interaction.reply(await quantityPokemon(interaction));
				return;
			}

			if (interaction.commandName === 'quantity-shiny') {
				interaction.reply(await quantityPokemon(interaction, true));
				return;
			}

			if (interaction.commandName === 'available') {
				const channelName = client.channels.cache.get(interaction.channelId).name;
				interaction.reply(await getAvailable(channelName));
				return;
			}

			if (interaction.commandName === 'zone') {
				interaction.reply(await getZoneForPokemon(interaction.options.getString('name')));
				return;
			}

			if (interaction.commandName === 'pokedex') {
				interaction.reply(await getPokedex(interaction, 'regular'));
				return;
			}

			if (interaction.commandName === 'shinydex') {
				interaction.reply(await getPokedex(interaction, 'shiny'));
				return;
			}

			if (interaction.commandName === 'shop') {
				interaction.reply(await shopMessage(interaction, true));
				return;
			}

			if (interaction.commandName === 'ball') {
				interaction.reply(await getBallTrainer(interaction));
				return;
			}
			if (interaction.commandName === 'evolution') {
				interaction.reply(
					await evolvePokemon(
						interaction.user.id,
						interaction.options.getString('name'),
						interaction.channel.name,
						interaction.options.getInteger('quantity'),
						false,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'evolution-shiny') {
				interaction.reply(
					await evolvePokemon(
						interaction.user.id,
						interaction.options.getString('name'),
						interaction.channel.name,
						interaction.options.getInteger('quantity'),
						true,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'sell') {
				interaction.reply(
					await sellPokemon(
						interaction.user.id,
						interaction.options.getString('name'),
						interaction.options.getInteger('quantity'),
						false,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'sell-shiny') {
				interaction.reply(
					await sellPokemon(
						interaction.user.id,
						interaction.options.getString('name'),
						interaction.options.getInteger('quantity'),
						true,
						interaction.options.getString('max') === 'true'
					)
				);
				return;
			}

			if (interaction.commandName === 'price') {
				interaction.reply(await getPrice(interaction.options.getString('name')));
				return;
			}

			if (interaction.commandName === 'rune-use') {
				interaction.reply(await spawnPokemonWithRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-buy') {
				interaction.reply(await buyRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-inventory') {
				interaction.reply(await checkRune(interaction));
				return;
			}

			if (interaction.commandName === 'rune-price') {
				interaction.reply(await pricePokemon(interaction.options.getString('name'), true));
				return;
			}

			if (interaction.commandName === 'number-evolution') {
				interaction.reply(await nbPokemon(interaction.options.getString('name')));
				return;
			}

			if (interaction.commandName === 'trade') {
				interaction.reply(await purposeSwapPokemon(interaction));
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
			if (name === 'name' || name === 'name_pokemon_offer' || name === 'name_pokemon_request') {
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
