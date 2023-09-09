import {
	addemojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
} from './createServerFunctions.js';
import {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
} from './trainerFunctions.js';
import {
	findRandomPokemon,
	catchPokemon,
	sellPokemon,
} from './pokemonFunctions.js';

function pokeChat(client) {
	client.on('ready', () => {
		console.log('Ready!');
	});

	client.on('guildMemberAdd', (member) => {
		if (member.user.bot) return;
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
			if (message.content === '!addEmojis') {
				await addemojis(message);
			}
			if (message.content === '!createAllChannels') {
				await createAllChannels(message);
			}
			if (message.content === '!deleteAllChannels') {
				await deleteAllChannels(message.guild);
			}
			if (message.content === '!initServer') {
				await initServer(message);
			}
			if (message.content === '!createRoles') {
				await addRoles(message);
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
		const balls = [
			{ name: 'pokeball', id: 1 },
			{ name: 'superball', id: 2 },
			{ name: 'hyperball', id: 3 },
			{ name: 'masterball', id: 4 },
		];
		if (
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
			const pokedex = await getPokedex(message.author.id);
			let strResponse = 'Vous avez : \n';
			for (let i = 0; i < pokedex.length; i++) {
				strResponse += `- ${pokedex[i].quantity} ${pokedex[i].name}\n`;
			}
			message.reply(strResponse);
		}
		if (message.content === '!money') {
			const money = await getMoney(message.author.id);
			message.reply('Vous avez : ' + money + ' pokédollars.');
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
	});

	client.login(process.env.TOKEN);
}

export default pokeChat;
