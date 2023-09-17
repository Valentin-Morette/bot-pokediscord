function botErika(clientErika) {
	clientErika.on('ready', () => {
		console.log('Erika Ready!');
	});

	clientErika.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'céladopole') return;
		if (message.content === '!info') {
			return message.reply(
				"Je suis Erika, le champion d'arène de type plante. Pour obtenir le badge prisme, il vous faudra au minimum 67 pokémons dont 23 différents."
			);
		}
		if (message.content === '!badge') {
			await getBadge(message, 67, 23, 'Prisme', '4 Badges');
		}
	});

	clientErika.login(process.env.TOKENERIKA);
}

export default botErika;
