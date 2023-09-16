import {
	addemojis,
	deleteEmojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
	listBot,
} from './createServerFunctions.js';
import {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
	buyBall,
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	catchPokemon,
	sellPokemon,
} from './pokemonFunctions.js';
import { slashCommande } from './createServerFunctions.js';

const balls = [
	{ name: 'pokeball', id: 1 },
	{ name: 'superball', id: 2 },
	{ name: 'hyperball', id: 3 },
	{ name: 'masterball', id: 4 },
];

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
			(ch) => ch.name === 'welcome'
		);
		if (welcomeChannel) {
			welcomeChannel.send(`Bienvenue ${member} sur le serveur!`);
		}
	});

	client.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		console.log(`Message received in channel: ${message.channel.name}`);
		if (message.author.id === process.env.MYDISCORDID) {
			if (message.content === '!initServer') {
				await initServer(message);
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
			}
		}
		if (message.content === '!cherche' || message.content === '!search') {
			const pokemon = await findRandomPokemon(message.channel.name);
			console.log(pokemon);
			message.channel.send(
				pokemon
					? `Un ${pokemon.name} sauvage apparaît !\nTapez !pokeball ${pokemon.catchCode} pour le capturer !`
					: `Il n'y a pas de pokémon sauvage dans cette zone !`
			);
		}
		if (message.content === '!ball') {
			message.reply(await getBallTrainer(message));
		}
		if (message.content.startsWith('!buy')) {
			const args = message.content.split(' ');
			const quantity = args[1];
			const nameBall = args[2];
			const idBall = balls.find((ball) => ball.name === nameBall).id;
			console.log(idBall);
			const response = await buyBall(
				message.author.id,
				idBall,
				quantity,
				nameBall
			);
			if (response) {
				message.reply(response);
			}
		} else if (
			message.content.startsWith('!') &&
			balls.some((ball) => message.content.includes(ball.name))
		) {
			const ball = balls.find((ball) => message.content.includes(ball.name));
			const ballName = ball.name;
			const idPokeball = ball.id;
			const catchCode = message.content.split(' ')[1];
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
			}
		}
		if (message.content === '!pokedex') {
			message.reply(await getPokedex(message.author.id));
		}
		if (message.content === '!money') {
			message.reply(await getMoney(message.author.id));
		}
		if (message.content.startsWith('!vend')) {
			const args = message.content.split(' ');
			const quantity = args[1];
			const namePokemon = args[2];
			const response = await sellPokemon(
				message.author.id,
				namePokemon,
				quantity
			);
			if (response) {
				message.reply(response);
			}
		}
		if (message.content === '!listBot') {
			await listBot(message);
		}
	});

	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isCommand()) return;

		const { commandName } = interaction;

		if (commandName === 'pokeball') {
			const quantite = interaction.options.getInteger('quantite');

			// await interaction.reply(`Vous avez acheté ${quantite} pokéballs!`);
		}
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
