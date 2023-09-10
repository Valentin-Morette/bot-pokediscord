function botKoga(clientKoga) {
	clientKoga.on('ready', () => {
		console.log('Koga Ready!');
	});

	clientKoga.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'parmanie') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '5 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 5 Badges!');
			}
		}
	});

	clientKoga.login(process.env.TOKENKOGA);
}

export default botKoga;
