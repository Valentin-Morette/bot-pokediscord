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
			// message.channel.send(
			// 	`Emoji ${pokeball.name} ajouté! <:${pokeball.name}:${emoji.id}>`
			// );
		});
	} catch (error) {
		console.error(error);
	}
}

function initServer(message) {
	deleteAllChannels(message.guild);
	createAllChannels(message);
	addemojis(message);
}

export { addemojis, createAllChannels, deleteAllChannels, initServer };
