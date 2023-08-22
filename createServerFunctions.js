import axios from 'axios';

async function createAllChannels(message) {
	try {
		const response = await axios.get('http://localhost:5000/zone');
		response.data.forEach((zone) => {
			message.guild.channels.create({
				name: zone.name,
				type: 0,
			});
		});
	} catch (error) {
		console.error(error);
	}
}

async function deleteAllChannels(guild) {
	const channels = guild.channels.cache.map((channel) => channel.delete());
}

async function addemojis(message) {
	try {
		const response = await axios.get('http://localhost:5000/pokeball');
		response.data.forEach(async (pokeball) => {
			const emoji = await message.guild.emojis.create({
				name: pokeball.name,
				attachment: './assets/emojis/' + pokeball.name + '.png',
			});
		});
	} catch (error) {
		console.error(error);
	}
}

async function addRoles(message) {
	try {
		const response = await axios.get('http://localhost:5000/role');
		response.data.forEach((role) => {
			message.guild.roles
				.create({
					name: role.name,
					color: role.color,
					hoist: true,
					permissions: [
						'0x0000000000200000',
						'0x0000000000100000',
						'0x0000000002000000',
						'0x0000000000080000',
						'0x0000000000010000',
						'0x0000000000000040',
						'0x0000000000000800',
						'0x0000000000000001',
						'0x0000000004000000',
						'0x0000000080000000',
					],
				})
				.then((role) => message.channel.send(`Le rôle ${role} a été créé!`))
				.catch((error) =>
					console.error(`Erreur lors de la création du rôle: ${error}`)
				);
		});
	} catch (error) {
		console.error(error);
	}
}

function initServer(message) {
	deleteAllChannels(message.guild);
	createAllChannels(message);
	addemojis(message);
	addRoles(message);
}

export {
	addemojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	initServer,
};
