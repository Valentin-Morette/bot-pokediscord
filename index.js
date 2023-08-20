import { Client, Colors, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import {
	addemojis,
	createAllChannels,
	deleteAllChannels,
	initServer,
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
	if (message.content === '!createRole') {
		// Vérifiez si le bot a la permission de gérer les rôles
		message.guild.roles
			.create({
				name: 'The roooolllleee',
				color: Colors.Blue,
				permissions: [
					'0x0000000000200000',
					'0x0000000000100000',
					'0x0000000002000000',
					'0x0000000000080000',
					'0x0000000000010000',
					'0x0000000000000040',
					'0x0000000000000800',
					'0x0000000000000001',
					'0x0000000004000000',
					'0x0000000080000000',
				],
			})
			.then((role) => message.channel.send(`Le rôle ${role} a été créé!`))
			.catch((error) =>
				console.error(`Erreur lors de la création du rôle: ${error}`)
			);
	}
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
	}
});

client.login(process.env.TOKEN);
