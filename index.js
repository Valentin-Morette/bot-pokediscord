import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import {
	addemojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
} from './createServerFunctions.js';
import { addTrainer } from './trainerFunctions.js';
import { findRandomPokemon } from './pokemonFunctions.js';
// import axios from 'axios';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.on('ready', () => {
	console.log('Ready!');

	// setInterval(() => {
	// 	console.log('Sending message...');
	// 	client.guilds.cache.forEach((guild) => {
	// 		// Récupérer tous les salons textuels
	// 		const textChannels = guild.channels.cache.filter(
	// 			(channel) => channel.type === 0
	// 		);

	// 		// Convertir la collection en tableau et choisir un élément aléatoire
	// 		const channelArray = Array.from(textChannels.values());
	// 		const randomChannel =
	// 			channelArray[Math.floor(Math.random() * channelArray.length)];

	// 		// Envoyer le message
	// 		if (randomChannel) {
	// 			findRandomPokemon(randomChannel.name).then((pokemon) => {
	// 				console.log(randomChannel.name);
	// 				console.log(pokemon);
	// 			});
	// 		}
	// 	});
	// }, 5000); // intervalle de 5 secondes
});

client.on('guildMemberAdd', (member) => {
	addTrainer(member);
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
});

client.login(process.env.TOKEN);
