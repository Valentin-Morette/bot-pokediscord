import {
	addemojis,
	deleteEmojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
	allMessage,
} from './createServerFunctions.js';
import {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
	buyBall,
	getPrice,
	nbPokemon,
	getBadge,
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

async function handleCatch(interaction, idPokeball) {
	const catchCode = interaction.customId.split('|')[1];
	const idTrainer = interaction.user.id;
	const response = await catchPokemon(catchCode, idTrainer, idPokeball);
	let replyMessage;
	let components;

	switch (response.status) {
		case 'noCatch':
			replyMessage = `Le ${response.pokemonName} est resorti, retentez votre chance !`;
			components = [createButtons(interaction.message, catchCode)];
			break;
		case 'catch':
			replyMessage = `Le ${response.pokemonName} a été capturé par <@${interaction.user.id}>.`;
			break;
		case 'escape':
			replyMessage = `Le ${response.pokemonName} s'est échappé !`;
			break;
		case 'alreadyCatch':
			replyMessage = `Le Pokémon a déjà été capturé.`;
			break;
		case 'alreadyEscape':
			replyMessage = `Le Pokémon s'est déjà échappé.`;
			break;
		case 'noBall':
			replyMessage = `Vous n'avez pas de ${
				balls.find((ball) => ball.id === idPokeball).name
			}.`;
			break;
		case 'noExistPokemon':
			replyMessage = `Le code ${catchCode} ne correspond à aucun pokémon.`;
			break;
		default:
			replyMessage = 'Une erreur inattendue s’est produite.';
	}

	interaction.reply({ content: replyMessage, components });
}

function createButtons(message, catchCode) {
	let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
	let row = new ActionRowBuilder();
	balls.forEach((ball) => {
		const customEmoji = message.guild.emojis.cache.find(
			(emoji) => emoji.name === ball
		);
		const button = new ButtonBuilder()
			.setCustomId(ball + '|' + catchCode)
			.setStyle(ButtonStyle.Secondary);
		button[customEmoji ? 'setEmoji' : 'setLabel'](
			customEmoji ? customEmoji.id : ball
		);

		row.addComponents(button);
	});

	return row;
}

const commandsPokechat = [
	{
		name: 'argent',
		description: 'Affiche votre argent',
	},
	{
		name: 'pokedex',
		description: 'Affiche votre pokedex',
	},
	{
		name: 'ball',
		description: 'Affiche vos pokéballs',
	},
	{
		name: 'evolution',
		description: 'Fait évoluer un pokémon',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'vendre',
		description: 'Vendre un / des pokémon(s)',
		options: [
			{
				name: 'quantité',
				type: 4,
				description: 'Quantité de pokémon',
				required: true,
			},
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'prix',
		description: "Affiche le prix d'une pokéball ou d'un pokémon",
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom de la pokéball ou du pokémon',
				required: true,
			},
		],
	},
	{
		name: 'nombre-evolution',
		description: 'Affiche le nombre de pokémon necessaire pour une évolution',
		options: [
			{
				name: 'nom',
				type: 3,
				description: 'Nom du pokémon à faire évoluer',
				required: true,
			},
		],
	},
	{
		name: 'cherche',
		description: 'Cherche un pokémon',
	},
	{
		name: 'canne',
		description: 'Pêche un pokémon avec la canne',
	},
	{
		name: 'super-canne',
		description: 'Pêche un pokémon avec la super canne',
	},
	{
		name: 'mega-canne',
		description: 'Pêche un pokémon avec la mega canne',
	},
];

function pokeChat(client) {
	slashCommande(commandsPokechat);
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
			} else if (message.content === '!allMessage') {
				await allMessage(message);
			} else if (message.content === '!listBot') {
				await listBot(message);
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
				const args = customId.split('|');
				let nbPokemon = args[1];
				let nbPokemonDiff = args[2];
				let badgeName = args[3];
				let newRole = args[4];
				await interaction.deferUpdate();
				interaction.user.send(
					await getBadge(
						interaction,
						nbPokemon,
						nbPokemonDiff,
						badgeName,
						newRole
					)
				);
			}
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

			if (interaction.commandName === 'argent') {
				interaction.reply(await getMoney(interaction.user.id));
				return;
			}

			if (interaction.commandName === 'pokedex') {
				interaction.reply(await getPokedex(interaction.user.id));
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
						interaction.options.getString('nom')
					)
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
			}

			if (interaction.commandName === 'nombre-evolution') {
				interaction.reply(
					await nbPokemon(interaction.options.getString('nom'))
				);
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
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
