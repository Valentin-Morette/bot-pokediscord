import {
	addemojis,
	deleteEmojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
	listBot,
	allPinMessage,
} from './createServerFunctions.js';
import {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
	buyBall,
	priceBall,
	pricePokemon,
	nbPokemon,
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	catchPokemon,
	sellPokemon,
	evolvePokemon,
} from './pokemonFunctions.js';
import { slashCommande } from './createServerFunctions.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';

const balls = [
	{ name: 'pokeball', id: 1 },
	{ name: 'superball', id: 2 },
	{ name: 'hyperball', id: 3 },
	{ name: 'masterball', id: 4 },
];

function ctrlBoutique(message) {
	if (message.channel.name !== 'boutique') {
		message.reply(
			'Vous devez être dans le salon boutique pour acheter des pokéballs.'
		);
		return false;
	}
	return true;
}

// const commandsPokechat = [
// 	{
// 		name: 'pokeball',
// 		description: 'Achète des pokéballs!',
// 		options: [
// 			{
// 				name: 'quantite',
// 				type: 4,
// 				description: 'Nombre de pokéballs à acheter',
// 				required: true,
// 			},
// 		],
// 	},
// ];

function pokeChat(client) {
	// slashCommande(commandsPokechat);
	client.on('ready', () => {
		console.log('Pokéchat Ready!');
	});

	client.on('guildMemberAdd', (member) => {
		if (member.user.bot) {
			member.roles.add(
				member.guild.roles.cache.find(
					(role) => role.name === "Champion d'arene"
				)
			);
			return;
		}
		addTrainer(member);
		let badgeRole = member.guild.roles.cache.find(
			(role) => role.name === '0 Badge'
		);

		if (badgeRole) {
			member.roles.add(badgeRole).catch(console.error);
		}

		const welcomeChannel = member.guild.channels.cache.find(
			(ch) => ch.name === 'accueil'
		);
		if (welcomeChannel) {
			welcomeChannel.send(`Bienvenue ${member} sur le serveur!`);
		}
	});

	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;

		if (message.content === '!button') {
			const button = new ButtonBuilder()
				.setCustomId('pokeball')
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Pokeball');
			const row = new ActionRowBuilder().addComponents(button);
			message.channel.send({ components: [row] });
		}
		if (
			message.content === '!cherche' ||
			message.content === '!canne' ||
			message.content === '!superCanne' ||
			message.content === '!megaCanne'
		) {
			let type = message.content.split('!')[1];
			type = type === 'cherche' ? 'herbe' : type;
			await findRandomPokemon(message, type);
			return;
		}

		if (balls.some((ball) => message.content.startsWith(`!${ball.name}`))) {
			const ball = balls.find((ball) => message.content.includes(ball.name));
			const ballName = ball.name;
			const idPokeball = ball.id;
			const catchCode = message.content.split(' ')[1];
			if (!catchCode || isNaN(catchCode)) {
				message.reply(
					`La commande doit être de la forme : !${ballName} [code]`
				);
				return;
			}
			const idTrainer = message.author.id;
			const response = await catchPokemon(catchCode, idTrainer, idPokeball);
			if (response.status === 'noCatch') {
				message.channel.send(
					`Le ${response.pokemonName} est resortit !\nTapez !pokeball ${catchCode} pour retenter votre chance.`
				);
			} else if (response.status === 'catch') {
				message.channel.send(
					`Le ${response.pokemonName} ${catchCode} a été capturé par <@${message.author.id}>.`
				);
			} else if (response.status === 'escape') {
				message.channel.send(
					`Le ${response.pokemonName} ${catchCode} s'est échappé !`
				);
			} else if (response.status === 'alreadyCatch') {
				message.reply(`Le Pokémon a déjà été capturé.`);
			} else if (response.status === 'alreadyEscape') {
				message.channel.send(`Le Pokémon c'est déjà échappé.`);
			} else if (response.status === 'noBall') {
				message.reply(`Vous n'avez pas de ${ballName}.`);
			} else if (response.status === 'noExistPokemon') {
				message.reply(`Le code ${catchCode} ne correspond à aucun pokémon.`);
			}
			return;
		}

		if (message.content === '!ball') {
			message.reply(await getBallTrainer(message));
			return;
		}

		if (message.content === '!pokedex') {
			message.reply(await getPokedex(message.author.id));
			return;
		}

		if (message.content.startsWith('!achat')) {
			if (!ctrlBoutique(message)) return;
			const args = message.content.split(' ');
			const quantity = args[1];
			const nameBall = args[2];
			const idBall = balls.find((ball) => ball.name === nameBall).id;
			const response = await buyBall(
				message.author.id,
				idBall,
				quantity,
				nameBall
			);
			if (response) {
				message.reply(response);
			}
			return;
		}

		if (message.content.startsWith('!nbEvolution')) {
			const args = message.content.split(' ');
			const namePokemon = args[1];
			if (!namePokemon) {
				message.reply(
					'La commande doit être de la forme : !nbEvolution [nom du pokémon]'
				);
				return;
			}
			await nbPokemon(message, namePokemon);
			return;
		}

		if (message.content.startsWith('!prix')) {
			if (!ctrlBoutique(message)) return;
			const args = message.content.split(' ');
			console.log(args);

			const isPokeball = balls.some((ball) => ball.name === args[1]);
			if (isPokeball) {
				const ball = balls.find((ball) => ball.name === args[1]);
				await priceBall(message, ball.id);
			} else {
				await pricePokemon(message, args[1]);
			}
			return;
		}

		if (message.content === '!money') {
			message.reply(await getMoney(message.author.id));
			return;
		}

		if (message.content.startsWith('!vend')) {
			if (!ctrlBoutique(message)) return;
			const args = message.content.split(' ');
			const quantity = args[1];
			if (isNaN(quantity)) {
				message.reply(
					'La commande doit être de la forme : !vend [quantité(nombre)] [nom du pokémon]'
				);
				return;
			}
			const namePokemon = args[2];
			const response = await sellPokemon(
				message.author.id,
				namePokemon,
				quantity
			);
			if (response) {
				message.reply(response);
			}
			return;
		}

		if (message.content.startsWith('!evolution')) {
			const args = message.content.split(' ');
			const namePokemon = args[1];
			const response = await evolvePokemon(message.author.id, namePokemon);
			if (response) {
				message.reply(response);
			}
			return;
		}

		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!initServer') {
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
			} else if (message.content === '!listBot') {
				await listBot(message);
			} else if (message.content === '!allPinMessage') {
				await allPinMessage(client);
			} else if (message.content === '!listBot') {
				await listBot(message);
			}
			return;
		}
	});

	// client.on('interactionCreate', async (interaction) => {
	// 	if (!interaction.isCommand()) return;

	// 	const { commandName } = interaction;

	// 	if (commandName === 'pokeball') {
	// 		const quantite = interaction.options.getInteger('quantite');

	// 		// await interaction.reply(`Vous avez acheté ${quantite} pokéballs!`);
	// 	}
	// });

	client.on('interactionCreate', async (interaction) => {
		if (interaction.isButton()) {
			if (interaction.customId === 'pokeball') {
				interaction.reply('pokeball');
				console.log('test');
				// const catchCode = interaction.message.embeds[0].description.split(' ')[2];
				// const idTrainer = interaction.user.id;
				// const idPokeball = 1;
				// const response = await catchPokemon(catchCode, idTrainer, idPokeball);
				// if (response.status === 'noCatch') {
				// 	interaction.reply(
				// 		`Le ${response.pokemonName} est resortit !\nTapez !pokeball ${catchCode} pour retenter votre chance.`
				// 	);
				// } else if (response.status === 'catch') {
				// 	interaction.reply(
				// 		`Le ${response.pokemonName} ${catchCode} a été capturé par <@${interaction.user.id}>.`
				// 	);
				// } else if (response.status === 'escape') {
				// 	interaction.reply(
				// 		`Le ${response.pokemonName} ${catchCode} s'est échappé !`
				// 	);
				// } else if (response.status === 'alreadyCatch') {
				// 	interaction.reply(`Le Pokémon a déjà été capturé.`);
				// } else if (response.status === 'alreadyEscape') {
				// 	interaction.reply(`Le Pokémon c'est déjà échappé.`);
				// } else if (response.status === 'noBall') {
				// 	interaction.reply(`Vous n'avez pas de pokeball.`);
				// } else if (response.status === 'noExistPokemon') {
				// 	interaction.reply(`Le code ${catchCode} ne correspond à aucun pokémon.`);
				// }
			}
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
