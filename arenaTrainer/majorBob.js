function botMajorBob(clientMajorBob) {
	clientMajorBob.on('ready', () => {
		console.log('Major Bob Ready!');
	});

	clientMajorBob.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'carmin-sur-mer') return;
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '3 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 3 Badges!');
			}
		}
	});

	clientMajorBob.login(process.env.TOKENMAJORBOB);
}

export default botMajorBob;
