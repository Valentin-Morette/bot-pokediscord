function botOndine(clientOndine) {
	clientOndine.on('ready', () => {
		console.log('Ondine Ready!');
	});

	clientOndine.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'azuria') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '2 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 2 Badges!');
			}
		}
	});

	clientOndine.login(process.env.TOKENONDINE);
}

export default botOndine;
