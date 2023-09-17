function botKoga(clientKoga) {
	clientKoga.on('ready', () => {
		console.log('Koga Ready!');
	});

	clientKoga.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'parmanie') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Koga, le champion d'arène de type poison. Pour obtenir le badge Âme, il vous faudra au minimum 80 pokémons dont 30 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 80, 30, 'Âme', '5 Badges');
		}
	});

	clientKoga.login(process.env.TOKENKOGA);
}

export default botKoga;
