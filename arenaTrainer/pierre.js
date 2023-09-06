function botPierre(clientPierre) {
	clientPierre.on('ready', () => {
		console.log('Ready!');
	});

	clientPierre.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '1 Badge'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 1 Badge!');
			}
		}
	});

	clientPierre.login(process.env.TOKENPIERRE);
}

export default botPierre;
