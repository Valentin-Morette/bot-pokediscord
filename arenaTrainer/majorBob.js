function botMajorBob(clientMajorBob) {
	clientMajorBob.on('ready', () => {
		console.log('Major Bob Ready!');
	});

	clientMajorBob.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'carmin-sur-mer') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis le Major Bob, le champion d'arène de type Electrik. Pour obtenir le badge Foudre, il vous faudra au minimum 50 pokémons dont 20 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 50, 20, 'Foudre', '3 Badges');
		}
	});

	clientMajorBob.login(process.env.TOKENMAJORBOB);
}

export default botMajorBob;
