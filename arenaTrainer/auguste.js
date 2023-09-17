function botAuguste(clientAuguste) {
	clientAuguste.on('ready', () => {
		console.log('Auguste Ready!');
	});

	clientAuguste.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'cramois-île') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Auguste, le champion d'arène de type feu. Pour obtenir le badge Volcan, il vous faudra au minimum 115 pokémons dont 45 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 115, 45, 'Volcan', '7 Badges');
		}
	});

	clientAuguste.login(process.env.TOKENAUGUSTE);
}

export default botAuguste;
