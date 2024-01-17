import axios from 'axios';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { EmbedBuilder } from 'discord.js';
import { AttachmentBuilder } from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';

async function sendArenaMessage(
	message,
	channelName,
	arenaChampion,
	badgeName,
	arenaDescription,
	nbPokemon,
	nbPokemonDiff,
	newRole
) {
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);

	if (channel) {
		const attachment = new AttachmentBuilder(`./assets/arenaTrainer/${arenaChampion.toLowerCase()}.png`);
		const embed = new EmbedBuilder()
			.setColor('#3498db')
			.setTitle(arenaChampion)
			.setDescription(arenaDescription)
			.setThumbnail(`attachment://${arenaChampion.toLowerCase()}.png`);
		let row = new ActionRowBuilder();
		const button = new ButtonBuilder()
			.setCustomId(`badge|${nbPokemon}|${nbPokemonDiff}|${badgeName}|${newRole}`)
			.setStyle(ButtonStyle.Primary)
			.setLabel(channelName == 'plateau-indigo' ? badgeName : `Badge ${badgeName}`);
		row.addComponents(button);
		await channel.send({
			embeds: [embed],
			files: [attachment],
			components: [row],
		});
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
	}
}

async function createAllChannels(message, client) {
	const arenaCity = [
		'argenta',
		'azuria',
		'carmin-sur-mer',
		'céladopole',
		'cramois-île',
		'jadielle',
		'parmanie',
		'Safrania',
	];
	const permissionsCancel = [
		{
			id: message.guild.roles.everyone.id,
			deny: ['0x0000000000000800'],
		},
		{
			id: client.user.id,
			allow: ['0x0000000000000800'],
		},
	];
	message.guild.channels.create({
		name: 'accueil',
		type: 0,
	});
	message.guild.channels.create({
		name: 'commandes',
		type: 0,
		permissionOverwrites: permissionsCancel,
	});
	message.guild.channels.create({
		name: 'boutique',
		type: 0,
		permissionOverwrites: permissionsCancel,
	});
	try {
		const response = await axios.get(`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/zone`);

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
					id: message.guild.roles.cache.find((r) => r.name === 8 - j + ' Badge' + (8 - j > 1 ? 's' : ''))
						.id,
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

		response.data.forEach(async (zone) => {
			let channel = await message.guild.channels.create({
				name: zone.name,
				type: 0,
				parent: categoryZone[zone.accesLevel].id,
			});

			if (arenaCity.includes(zone.name)) {
				let permissions = [];

				for (let i = zone.accesLevel; i <= 8; i++) {
					let roleName = i + ' Badge' + (i > 1 ? 's' : '');
					let role = message.guild.roles.cache.find((r) => r.name === roleName);

					if (role) {
						permissions.push({
							id: role.id,
							allow: ['0x0000000000000400'],
						});
					}
				}

				permissions.push({
					id: message.guild.roles.everyone.id,
					deny: ['0x0000000000000400', '0x0000000000000800'],
				});

				await channel.permissionOverwrites.set(permissions);
			}
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
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokeball`
		);
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
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokeball`
		);
		response.data.forEach(async (pokeball) => {
			const emoji = await message.guild.emojis.cache.find((emoji) => emoji.name === pokeball.name);
			emoji.delete();
		});
	} catch (error) {
		console.error(error);
	}
}

async function addRoles(message) {
	try {
		const response = await axios.get(`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/role`);

		for (let roleData of response.data) {
			const options = {
				name: roleData.name,
				color: roleData.color,
				hoist: true,
			};

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

async function deleteAllRoles(message) {
	try {
		message.guild.roles.cache.map((role) => role.delete());
	} catch (error) {
		console.error(error);
	}
}

async function initServer(message, client) {
	await deleteAllRoles(message);
	await deleteAllChannels(message.guild);
	await deleteEmojis(message);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await addRoles(message);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	await addemojis(message);
	await createAllChannels(message, client);
	await new Promise((resolve) => setTimeout(resolve, 18000));
	await allMessage(message);
}

async function commandesMessage(message) {
	let channelName = 'commandes';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const messages = await channel.messages.fetch();
		await channel.bulkDelete(messages);
		const commandEmbed = new EmbedBuilder()
			.setColor('#3498db')
			.setTitle('Liste des Commandes du Serveur')
			.setDescription(
				'- /cherche : pour chercher un pokémon.\n' +
					'- /canne : pour pêcher un pokémon avec la canne.\n' +
					'- /superCanne : pour pêcher un pokémon avec la super canne.\n' +
					'- /megaCanne : pour pêcher un pokémon avec la mega canne.\n' +
					'- /vendre [quantité] [nom du pokémon] : pour vendre un pokémon.\n' +
					'- /nombre-evolution [nom du pokémon] : pour voir le nombre de pokémon necessaire pour une évolution.\n' +
					'- /evolution [nom du pokémon] : pour faire évoluer un pokémon.\n' +
					'- /argent : pour voir votre argent.\n' +
					'- /ball : pour voir toutes vos pokéballs.\n' +
					"- /prix [nom de la pokéball] : pour voir le prix d'achat d'une pokéball.\n" +
					"- /prix [nom du pokémon] : pour voir le prix de vente d'un pokémon.\n" +
					'- /disponible : pour voir les pokémons disponibles dans la zone.\n' +
					'- /echange [nombre pokemon proposé] [nom du pokemon proposé] [nombre pokemon demandé] [nom du pokemon demandé] : pour échanger des pokémons avec un autre joueur.\n' +
					"- /zone [nom du pokemon] : pour voir les zones d'apparitions d'un pokémon."
			);

		channel.send({ embeds: [commandEmbed] });
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
	}

	channelName = 'boutique';
	channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
}

async function allMessage(message) {
	commandesMessage(message);
	let channelName = 'boutique';
	let channel = message.guild.channels.cache.find((channel) => channel.name === channelName);
	if (channel) {
		const priceEmbed = new EmbedBuilder()
			.setColor('#3498db')
			.setTitle('Prix des pokéballs')
			.setDescription(
				'- Pokéball : 50$\n' +
					'- Superball : 80$\n' +
					'- Hyperball : 150$\n' +
					'- Masterball : 100 000$\n'
			);

		channel.send({ embeds: [priceEmbed] });
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		for (let i = 1; i <= 100; i *= 10) {
			let row = new ActionRowBuilder();
			balls.forEach((ball) => {
				const customEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === ball);
				const button = new ButtonBuilder()
					.setCustomId('buy|' + i + '|' + ball)
					.setStyle(ButtonStyle.Secondary)
					.setLabel('' + i)
					.setEmoji(customEmoji.id);

				row.addComponents(button);
			});
			channel.send({ components: [row] });
		}
	} else {
		console.error(`Aucun canal trouvé avec le nom ${channelName}`);
	}

	sendArenaMessage(
		message,
		'argenta',
		'Caillou',
		'Roche',
		"Je suis Caillou, le champion d'arène de type roche. Pour obtenir le badge roche, il vous faudra au minimum 10 pokémons dont 5 différents.",
		10,
		5,
		'1 Badge'
	);

	sendArenaMessage(
		message,
		'azuria',
		'Flaquette',
		'Cascade',
		"Je suis Flaquette, le champion d'arène de type eau. Pour obtenir le badge cascade, il vous faudra au minimum 33 pokémons dont 12 différents.",
		33,
		12,
		'2 Badges'
	);

	sendArenaMessage(
		message,
		'carmin-sur-mer',
		'SergentPile',
		'Foudre',
		"Je suis le Sergent Pile, le champion d'arène de type Electrik. Pour obtenir le badge Foudre, il vous faudra au minimum 50 pokémons dont 20 différents.",
		50,
		20,
		'3 Badges'
	);

	sendArenaMessage(
		message,
		'céladopole',
		'Fleurika',
		'Prisme',
		"Je suis Fleurika, le champion d'arène de type plante. Pour obtenir le badge prisme, il vous faudra au minimum 67 pokémons dont 23 différents.",
		67,
		23,
		'4 Badges'
	);

	sendArenaMessage(
		message,
		'parmanie',
		'Kouga',
		'Ame',
		"Je suis Kouga, le champion d'arène de type poison. Pour obtenir le badge Âme, il vous faudra au minimum 80 pokémons dont 30 différents.",
		80,
		30,
		'5 Badges'
	);

	sendArenaMessage(
		message,
		'safrania',
		'Mordane',
		'Marais',
		"Je suis Mordane, le champion d'arène de type psy. Pour obtenir le badge Marais, il vous faudra au minimum 99 pokémons dont 35 différents.",
		99,
		35,
		'6 Badges'
	);

	sendArenaMessage(
		message,
		'cramois-île',
		'Aoutiste',
		'Volcan',
		"Je suis Aoûtiste, le champion d'arène de type feu. Pour obtenir le badge Volcan, il vous faudra au minimum 115 pokémons dont 45 différents.",
		115,
		45,
		'7 Badges'
	);

	sendArenaMessage(
		message,
		'jadielle',
		'Giavonnou',
		'Terre',
		"Je suis Giavonnou, le champion d'arène de type sol. Pour obtenir le badge Terre, il vous faudra au minimum 150 pokémons dont 50 différents.",
		150,
		50,
		'8 Badges'
	);

	sendArenaMessage(
		message,
		'plateau-indigo',
		'Reglisse',
		'Maitre Pokémon',
		'Je suis Reglisse, le maitre de la ligue pokémon. Pour devenir un Maître Pokémon, il vous faudra au minimum 1200 pokémons dont 151 différents.',
		1200,
		151,
		'Maître Pokémon'
	);
}

function slashCommande(commands) {
	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log("Début de l'enregistrement des commandes slash.");

			await rest.put(Routes.applicationGuildCommands(process.env.IDAPPLICATION, process.env.IDSERVER), {
				body: commands,
			});

			console.log('Commandes slash enregistrées avec succès !');
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
	slashCommande,
	allMessage,
	commandesMessage,
};
