import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import {
	addemojis,
	createAllChannels,
	deleteAllChannels,
} from './createServerFunctions.js';
import { addTrainer } from './trainerFunctions.js';

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
		if (message.content === '!addemojis') {
			await addemojis(message);
		}
		if (message.content === '!create-all-channels') {
			await createAllChannels(message);
		}
		if (message.content === '!delete-all-channels') {
			await deleteAllChannels(message.guild);
		}
	}
});

client.login(process.env.TOKEN);
