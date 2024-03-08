import {
	addemojis,
	deleteEmojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
	allMessage,
	commandesMessage,
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
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	evolvePokemon,
	clearOldWildPokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemon,
	spawnPokemonWithRune,
} from './pokemonFunctions.js';
import { slashCommande } from './createServerFunctions.js';
import { commandsPokechat, balls } from './variables.js';
import { heartbeat } from './globalFunctions.js';

function pokeChat(client) {
	slashCommande(commandsPokechat);

	client.on('ready', () => {
		console.log('Pokéchat Ready!');
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
		if (member.user.bot) {
			member.roles.add(member.guild.roles.cache.find((role) => role.name === "Champion d'arene"));
			return;
		}
		addTrainer(member);
		let badgeRole = member.guild.roles.cache.find((role) => role.name === '0 Badge');

		if (badgeRole) {
			member.roles.add(badgeRole).catch(console.error);
		}

		const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === 'accueil');
		if (welcomeChannel) {
			welcomeChannel.send(`Bienvenue ${member} sur le serveur!`);
		}
	});

	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content.startsWith('!spawn')) {
				await spawnPokemon(message, client);
			} else if (message.content === '!initServer') {
				await initServer(message, client);
			} else if (message.content === '!createAllChannels') {
				await createAllChannels(message);
			} else if (message.content === '!deleteAllChannels') {
				await deleteAllChannels(message.guild);
			} else if (message.content === '!addEmojis') {
				await addemojis(message);
			} else if (message.content === '!createRoles') {
				await addRoles(message);
			} else if (message.content === '!deleteEmojis') {
				await deleteEmojis(message.guild);
			} else if (message.content === '!allMessage') {
				await allMessage(message);
			} else if (message.content === '!updateCmdMessage') {
				await commandesMessage(message);
			}
			return;
		}
	});

	client.on('interactionCreate', async (interaction) => {
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
					await interaction.followUp(`L'échange a été éffectué avec succès.`);
				}
			}
			return;
		}

		if (interaction.isCommand()) {
			if (interaction.commandName === 'cherche') {
				interaction.reply(await findRandomPokemon(interaction, 'herbe'));
				return;
			}

			if (interaction.commandName === 'mega-canne') {
				interaction.reply(await findRandomPokemon(interaction, 'megaCanne'));
				return;
			}

			if (interaction.commandName === 'canne') {
				interaction.reply(await findRandomPokemon(interaction, 'canne'));
				return;
			}

			if (interaction.commandName === 'super-canne') {
				interaction.reply(await findRandomPokemon(interaction, 'superCanne'));
				return;
			}

			if (interaction.commandName === 'argent') {
				interaction.reply(await getMoney(interaction.user.id));
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

			if (interaction.commandName === 'shinydex') {
				interaction.reply(await getPokedex(interaction, 'shiny'));
				return;
			}

			if (interaction.commandName === 'ball') {
				interaction.reply(await getBallTrainer(interaction));
				return;
			}

			if (interaction.commandName === 'evolution') {
				interaction.reply(
					await evolvePokemon(interaction.user.id, interaction.options.getString('nom'))
				);
				return;
			}

			if (interaction.commandName === 'vendre') {
				interaction.reply(
					await sellPokemon(
						interaction.user.id,
						interaction.options.getString('nom'),
						interaction.options.getInteger('quantité')
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

			if (interaction.commandName === 'rune-achat') {
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
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
