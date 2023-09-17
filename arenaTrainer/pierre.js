import { getBadge } from '../trainerFunctions.js';
function botPierre(clientPierre) {
	clientPierre.on('ready', () => {
		console.log('Pierre Ready!');
	});

	clientPierre.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'argenta') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Pierre, le champion d'arène de type roche. Pour obtenir le badge roche, il vous faudra au minimum 10 pokémons dont 5 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 10, 5, 'Roche', '1 Badge');
		}
	});

	clientPierre.login(process.env.TOKENPIERRE);
}

export default botPierre;
