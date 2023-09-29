import axios, { all } from 'axios';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

async function createAllChannels(message, client) {
	message.guild.channels.create({
		name: 'accueil',
		type: 0,
	});
	message.guild.channels.create({
		name: 'commandes',
		type: 0,
		permissionOverwrites: [
			{
				id: message.guild.roles.everyone.id,
				deny: ['0x0000000000000800'],
			},
			{
				id: client.user.id,
				allow: ['0x0000000000000800'],
			},
		],
	});
	message.guild.channels.create({
		name: 'boutique',
		type: 0,
	});
	try {
		const response = await axios.get('http://localhost:5000/zone');

		const categoryZone = {};

		for (let i = 0; i < 9; i++) {
			let roleName = i + ' Badge' + (i > 1 ? 's' : '');

			let role = message.guild.roles.cache.find((r) => r.name === roleName);

			if (-!role) {
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

async function deleteEmojis(message) {
	try {
		const response = await axios.get('http://localhost:5000/pokeball');
		response.data.forEach(async (pokeball) => {
			const emoji = await message.guild.emojis.cache.find(
				(emoji) => emoji.name === pokeball.name
			);
			emoji.delete();
		});
	} catch (error) {
		console.error(error);
	}
}

async function addRoles(message) {
	try {
		const response = await axios.get('http://localhost:5000/role');

		for (let roleData of response.data) {
			const options = {
				name: roleData.name,
				color: roleData.color,
				hoist: true,
			};

			if (roleData.name === "Champion d'arene") {
				options.permissions = ['0x0000000000000008'];
			} else {
				options.permissions = [
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
				];
			}

			try {
				const role = await message.guild.roles.create(options);
				console.log(`Le rôle ${role.name} a été créé- !`);
			} catch (error) {
				console.error(`Erreur lors de la création du rôle: ${error}`);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

async function listBot(message) {
	try {
		const response = await axios.get('http://localhost:5000/champion');
		let strResponse = 'Liste des bots : \n';
		for (let i = 0; i < response.data.length; i++) {
			strResponse += `- ${response.data[i].name} : ${response.data[i].link}\n`;
		}
		message.author.send(strResponse);
	} catch (error) {
		console.error(error);
	}
}

async function initServer(message, client) {
	await deleteAllChannels(message.guild);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await addRoles(message);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await addemojis(message);
	await createAllChannels(message, client);
	await new Promise((resolve) => setTimeout(resolve, 10000));
	await listBot(message);
	await allPinMessage(message.guild);
}

async function allPinMessage(guild) {
	let channelName = 'commandes';
	let channel = guild.channels.cache.find(
		(channel) => channel.name === channelName
	);
	if (channel) {
		channel
			.send(
				'Liste des commandes du serveur : \n' +
					'- !cherche : pour chercher un pokémon.\n' +
					'- !canne : pour pêcher un pokémon avec la canne.\n' +
					'- !superCanne : pour pêcher un pokémon avec la super canne.\n' +
					'- !megaCanne : pour pêcher un pokémon avec la mega canne.\n' +
					'- /vendre [quantité] [nom du pokémon] : pour vendre un pokémon.(Uniquement dans le salon boutique)\n' +
					'- /nombre-evolution [nom du pokémon] : pour voir le nombre de pokémon necessaire pour une évolution.\n' +
					'- /evolution [nom du pokémon] : pour faire évoluer un pokémon.\n' +
					'- /money : pour voir votre argent.\n' +
					'- /ball : pour voir toutes vos pokéballs.\n' +
					'- !achat [quantité] [nom de la pokéball] : pour acheter des pokéballs.(Uniquement dans le salon boutique)\n' +
					"- /prix [nom de la pokéball] : pour voir le prix d'achat d'une pokéball.(Uniquement dans le salon boutique)\n" +
					"- /prix [nom du pokémon] : pour voir le prix de vente d'un pokémon.(Uniquement dans le salon boutique)\n" +
					"- !info : pour connaitre des conditions d'obtention du badge.(Uniquement dans la ville du champion)\n" +
					"- !badge : pour obtenir le badge de l'arene.(Uniquement dans la ville du champion)\n"
			)
			.then((message) => {
				message.pin().catch(console.error);
			})
			.catch(console.error);
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
	}
}

function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log("Début de l'enregistrement des commandes slash.");

			await rest.put(
				Routes.applicationGuildCommands(
					'1142325515575889971',
					'1156675880484081696'
				),
				{
					body: commands,
				}
			);

			console.log('Commandes slash enregistrées avec succès- !');
		} catch (error) {
			console.error(error);
		}
	})();
}

export {
	addemojis,
	createAllChannels,
	deleteAllChannels,
	addRoles,
	deleteEmojis,
	initServer,
	listBot,
	slashCommande,
	allPinMessage,
};
