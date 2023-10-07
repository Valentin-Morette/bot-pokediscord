import dotenv from 'dotenv';
import { clientPokechat } from './varClients.js';
import pokeChat from './pokechat.js';

dotenv.config();

pokeChat(clientPokechat);

process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
