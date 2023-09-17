function botMorgane(clientMorgane) {
	clientMorgane.on('ready', () => {
		console.log('Morgane Ready!');
	});

	clientMorgane.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'safrania') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Morgane, le champion d'arène de type psy. Pour obtenir le badge Marais, il vous faudra au minimum 99 pokémons dont 35 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 99, 35, 'Marais', '6 Badges');
		}
	});

	clientMorgane.login(process.env.TOKENMORGANE);
}

export default botMorgane;
