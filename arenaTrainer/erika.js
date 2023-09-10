function botErika(clientErika) {
	clientErika.on('ready', () => {
		console.log('Erika Ready!');
	});

	clientErika.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'céladopole') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '4 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 4 Badges!');
			}
		}
	});

	clientErika.login(process.env.TOKENERIKA);
}

export default botErika;
