import axios from 'axios';

async function createAllChannels(message) {
	try {
		const response = await axios.get('http://localhost:5000/zone');

		const categoryZone = {};

		for (let i = 0; i < 9; i++) {
			let roleName = i + ' Badge' + (i > 1 ? 's' : '');

			let role = message.guild.roles.cache.find((r) => r.name === roleName);

			if (!role) {
				console.error(`Rôle "${roleName}" introuvable`);
				continue;
			}

			let permissionOverwrites = [];

			for (let j = 0; j <= 8 - i; j++) {
				permissionOverwrites.push({
					id: message.guild.roles.cache.find(
						(r) => r.name === 8 - j + ' Badge' + (8 - j > 1 ? 's' : '')
					).id,
					allow: ['0x0000000000000400', '0x0000000000000800'],
				});
			}

			permissionOverwrites.push({
				id: message.guild.roles.everyone.id,
				deny: ['0x0000000000000400'],
			});

			categoryZone[i] = await message.guild.channels.create({
				name: roleName,
				type: 4,
				permissionOverwrites: permissionOverwrites,
			});
		}

		response.data.forEach((zone) => {
			message.guild.channels.create({
				name: zone.name,
				type: 0,
				parent: categoryZone[zone.accesLevel].id,
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
