function botMorgane(clientMorgane) {
	clientMorgane.on('ready', () => {
		console.log('Morgane Ready!');
	});

	clientMorgane.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'safrania') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '6 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 6 Badges!');
			}
		}
	});

	clientMorgane.login(process.env.TOKENMORGANE);
}

export default botMorgane;
