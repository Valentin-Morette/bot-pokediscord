function botAuguste(clientAuguste) {
	clientAuguste.on('ready', () => {
		console.log('Auguste Ready!');
	});

	clientAuguste.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'cramois-île') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '7 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 7 Badges!');
			}
		}
	});

	clientAuguste.login(process.env.TOKENAUGUSTE);
}

export default botAuguste;
