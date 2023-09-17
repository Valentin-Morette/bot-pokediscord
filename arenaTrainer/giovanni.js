function botGiovanni(clientGiovanni) {
	clientGiovanni.on('ready', () => {
		console.log('Giovanni Ready!');
	});

	clientGiovanni.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'jadielle') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Giovanni, le champion d'arène de type sol. Pour obtenir le badge Terre, il vous faudra au minimum 150 pokémons dont 50 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 150, 50, 'Terre', '8 Badges');
		}
	});

	clientGiovanni.login(process.env.TOKENGIOVANNI);
}

export default botGiovanni;
