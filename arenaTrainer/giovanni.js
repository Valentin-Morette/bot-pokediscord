function botGiovanni(clientGiovanni) {
	clientGiovanni.on('ready', () => {
		console.log('Giovanni Ready!');
	});

	clientGiovanni.on('messageCreate', async (message) => {
		if (message.author.bot) return;
		if (message.channel.name !== 'jadielle') return;
		if (!message.member.roles.cache.find((role) => role.name === '7 Badges')) {
			message.reply("Vous n'avez même pas 7 Badges!");
			return;
		}
		if (message.content === '!upgrade') {
			let badgeRole = message.guild.roles.cache.find(
				(role) => role.name === '8 Badges'
			);

			if (badgeRole) {
				message.member.roles.add(badgeRole).catch(console.error);
				message.reply('Vous avez reçu le rôle 8 Badges!');
			}
		}
	});

	clientGiovanni.login(process.env.TOKENGIOVANNI);
}

export default botGiovanni;
