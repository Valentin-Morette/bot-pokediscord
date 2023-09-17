function botOndine(clientOndine) {
	clientOndine.on('ready', () => {
		console.log('Ondine Ready!');
	});

	clientOndine.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'azuria') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Ondine, le champion d'arène de type eau. Pour obtenir le badge cascade, il vous faudra au minimum 33 pokémons dont 12 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 33, 12, 'Cascade', '2 Badges');
		}
	});

	clientOndine.login(process.env.TOKENONDINE);
}

export default botOndine;
