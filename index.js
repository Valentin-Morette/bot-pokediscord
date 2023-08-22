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
});

client.login(process.env.TOKEN);
