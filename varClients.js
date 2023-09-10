import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commonIntents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
];

const clientPokechat = new Client({
	intents: commonIntents,
});

const clientPierre = new Client({
	intents: commonIntents,
});

const clientOndine = new Client({
	intents: commonIntents,
});

const clientMajorBob = new Client({
	intents: commonIntents,
});

const clientErika = new Client({
	intents: commonIntents,
});

const clientKoga = new Client({
	intents: commonIntents,
});

const clientMorgane = new Client({
	intents: commonIntents,
});

const clientAuguste = new Client({
	intents: commonIntents,
});

const clientGiovanni = new Client({
	intents: commonIntents,
});

export {
	clientPokechat,
	clientPierre,
	clientOndine,
	clientMajorBob,
	clientErika,
	clientKoga,
	clientMorgane,
	clientAuguste,
	clientGiovanni,
};
