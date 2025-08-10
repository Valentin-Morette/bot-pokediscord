import { ActionRowBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder, ChannelType } from 'discord.js';
import { upFirstLetter, createListEmbed, API, correctNameZone } from './globalFunctions.js';
import { getIsPremium } from './trainerFunctions.js';
import { XEmbed, GamsGoEmbed, premiumEmbed, premiumAdEmbed } from './listEmbed.js';

let commandCount = 0;
let embedIndex = 0;

const embedFunctions = [XEmbed, premiumAdEmbed];

async function findRandomPokemon(interaction, followUp = false) {
	commandCount++;
	if (!interaction.replied && !interaction.deferred) {
		await interaction.deferReply();
	}
	try {
		const randomPokemon = await API.post(`/pokemon/wild`, {
			nameZone: correctNameZone(interaction.channel.name),
		});
		if (randomPokemon.data.length === 0) {
			return await interaction.editReply({
				content: "Il n'y a pas de Pokémon sauvage dans cette zone.",
				ephemeral: true,
			});
		}
		let pokemon = randomPokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemon.idPokemonWild)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});
		let star = pokemon.isShiny ? '✨' : '';
		const color = pokemon.isShiny ? '#ffed00' : '#FFFFFF';
		const embed = new EmbedBuilder()
			.setTitle(`Un ${pokemon.name + star} sauvage apparaît !`)
			.setDescription('Attrape-le !')
			.setThumbnail(pokemon.isShiny ? pokemon.imgShiny : pokemon.img)
			.setColor(color);

		const responseOptions = {
			embeds: [embed],
			components: [row],
		};

		if (commandCount % 40 === 0) {
			if (!(await getIsPremium(interaction.user.id))) {
				const { embeds: extraEmbeds, files: extraFiles } =
					await embedFunctions[embedIndex % embedFunctions.length](color);

				responseOptions.embeds.push(...extraEmbeds);
				if (extraFiles) {
					if (!responseOptions.files) responseOptions.files = [];
					responseOptions.files.push(...extraFiles);
				}
				embedIndex++;
			}
		}

		if (followUp) {
			await interaction.followUp(responseOptions);
		} else if (interaction.deferred) {
			await interaction.editReply(responseOptions);
		}
	} catch (error) {
		console.error('Erreur lors de la recherche du Pokémon.', error);
		if (followUp) {
			await interaction.followUp('Erreur lors de la recherche du Pokémon.');
		} else if (interaction.deferred) {
			await interaction.editReply('Erreur lors de la recherche du Pokémon.');
		}
	}
}

async function spawnRandomPokemon(context, followUp = false) {
	const isInteraction = !!context?.reply;
	const channel = isInteraction ? context.channel : context;

	try {
		const zoneName = correctNameZone(channel.name);

		const { data: pokemons } = await API.post(`/pokemon/wild`, {
			nameZone: zoneName,
		});

		if (!pokemons || pokemons.length === 0) {
			const message = "Il n'y a pas de Pokémon sauvage dans cette zone.";
			if (isInteraction) {
				if (!context.replied && !context.deferred) await context.deferReply();
				return context.editReply({ content: message, ephemeral: true });
			} else {
				return channel.send(message);
			}
		}

		const pokemon = pokemons;
		const balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		const row = new ActionRowBuilder();

		balls.forEach((ball) => {
			const emoji = channel.guild.emojis.cache.find((e) => e.name === ball);
			const btn = new ButtonBuilder()
				.setCustomId(`${ball}|${pokemon.idPokemonWild}`)
				.setStyle(ButtonStyle.Secondary);
			btn[emoji ? 'setEmoji' : 'setLabel'](emoji ? emoji.id : ball);
			row.addComponents(btn);
		});

		const isShiny = pokemon.isShiny;
		const star = isShiny ? '✨' : '';
		const embed = new EmbedBuilder()
			.setTitle(`Un ${pokemon.name + star} sauvage apparaît !`)
			.setDescription("Attrape-le !")
			.setThumbnail(isShiny ? pokemon.imgShiny : pokemon.img)
			.setColor(isShiny ? '#ffed00' : '#ffffff');

		const responseOptions = {
			embeds: [embed],
			components: [row],
		};

		if (++commandCount % 40 === 0 && isInteraction) {
			if (!(await getIsPremium(context.user.id))) {
				const { embed: extraEmbed, attachment } =
					embedFunctions[embedIndex % embedFunctions.length](embed.data.color);
				responseOptions.embeds.push(extraEmbed);
				if (attachment) {
					responseOptions.files = responseOptions.files || [];
					responseOptions.files.push(attachment);
				}
				embedIndex++;
			}
		}

		if (isInteraction) {
			if (!context.replied && !context.deferred) await context.deferReply();
			return context.editReply(responseOptions);
		} else {
			return channel.send(responseOptions);
		}
	} catch (error) {
		console.error("❌ Erreur lors du spawn de Pokémon :", error);
		if (isInteraction) {
			if (!context.replied && !context.deferred) await context.deferReply();
			return context.editReply("Erreur lors de la recherche du Pokémon.");
		} else {
			return channel.send("Erreur lors de la recherche du Pokémon.");
		}
	}
}


async function spawnPokemonWithRune(interaction) {
	const idTrainer = interaction.user.id;
	const pokemonName = interaction.options.getString('nom');
	try {
		const pokemon = await API.post(`/rune/use`, {
			idTrainer: idTrainer,
			pokemonName: pokemonName,
		});
		if (pokemon.data.status === 'noRune') {
			return `Vous n'avez pas de rune de ${upFirstLetter(pokemonName)}.`;
		}
		let pokemonSpawn = pokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemonSpawn.idPokemonWild)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});
		let img = pokemonSpawn.isShiny ? pokemonSpawn.imgShiny : pokemonSpawn.img;
		let star = pokemonSpawn.isShiny ? '✨' : '';
		const embed = createListEmbed(
			'Attrapez-le !',
			`Vous avez fait apparaître un ${pokemonSpawn.name + star} !`,
			null,
			img,
			null,
			'#9f53ec'
		);

		return {
			embeds: [embed],
			components: [row],
		};
	} catch (error) {
		console.error(error);
	}
}

async function evolvePokemon(idTrainer, namePokemon, nameZone, quantity, isShiny, max = false) {
	quantity = quantity == null && !max ? 1 : quantity;
	if (quantity < 1 && !max) {
		return 'Voius devez entrer unn quantité supérieur à 0.';
	}
	if (max && quantity != null) {
		max = false;
	}
	try {
		const evolvePokemon = await API.post(`/pokemon/evolve`, {
			namePokemon: namePokemon,
			idTrainer: idTrainer,
			nameZone: correctNameZone(nameZone),
			isShiny: isShiny,
			quantity: quantity,
			max: max,
		});
		const pokemon = evolvePokemon.data;
		if (pokemon.status === 'noPokemon') {
			return (
				"Vous avez besoin d'au moins " +
				pokemon.numberPokemon * pokemon.quantity +
				' ' +
				upFirstLetter(namePokemon) +
				' pour ' +
				(pokemon.numberPokemon > 1 ? 'les' : 'le') +
				' faire évoluer.'
			);
		} else if (pokemon.status === 'evolve') {
			let star = pokemon.isShiny ? '✨' : '';
			const embed = new EmbedBuilder()
				.setTitle(
					`Vous avez fait évoluer ${pokemon.quantity * pokemon.pokemonPreEvolve.numberEvolution} ${upFirstLetter(namePokemon) + star
					} en ${pokemon.quantity} ${pokemon.pokemonEvolve.name + star}!`
				)
				.setDescription(
					'Félicitation! Vous avez obtenu ' +
					pokemon.quantity +
					(pokemon.quantity > 1 ? ' nouveaux ' : ' nouveau ') +
					pokemon.pokemonEvolve.name +
					star +
					'.'
				)
				.setThumbnail(pokemon.isShiny ? pokemon.pokemonEvolve.imgShiny : pokemon.pokemonEvolve.img)
				.setFooter({
					text: 'Evolution de ' + upFirstLetter(namePokemon),
				})
				.setTimestamp()
				.setColor(pokemon.isShiny ? '#ffed00' : '#FFFFFF');
			return { embeds: [embed] };
		} else if (pokemon.status === 'noEvolution') {
			return upFirstLetter(namePokemon) + " n'a pas d'évolution.";
		} else if (pokemon.status === 'noExistPokemon') {
			return upFirstLetter(namePokemon) + ' n’est pas un Pokémon.';
		} else if (pokemon.status === 'noMaster') {
			return upFirstLetter(namePokemon) + ' ne peut pas évoluer si vous n’êtes pas Maître Pokémon.';
		} else {
			return "Erreur lors de l'évolution du Pokémon.";
		}
	} catch (error) {
		console.error("Error during the Pokemon's evolution.");
	}
}

async function clearOldWildPokemon() {
	try {
		await API.delete(`/pokemon/wild`);
	} catch (error) {
		console.error(error);
	}
}

async function nbPokemon(namePokemon) {
	try {
		const response = await API.post(`/pokemon/info`, { namePokemon });
		let pokemon = response.data;

		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} is not a Pokemon`;
		}

		let description = null;
		let title = '';

		// Evolution de Évoli
		if (pokemon.infos.id === 133) {
			title = `Vous avez besoin de ${pokemon.infos.numberEvolution} ${upFirstLetter(
				namePokemon
			)} pour le faire évoluer.`;
			description =
				`\nZones d'évolution :\n` +
				`- Voltali : La Centrale.\n` +
				`- Pyroli : La Route Victoire.\n` +
				`- Aquali : Les Îles Écume.\n` +
				`- Mentali : La Tour Cendrée.\n` +
				`- Noctali : L'Antre noir.\n` +
				`- Phyllali : La Forêt Vestigion.\n` +
				`- Givrali : Le Temple Frimapic.\n` +
				`- Aléatoire : autres zones.`;
		} else {
			title =
				pokemon.infos.numberEvolution === null
					? `${upFirstLetter(namePokemon)} ne peut pas évoluer.`
					: `Vous avez besoin de ${pokemon.infos.numberEvolution} ${upFirstLetter(
						namePokemon
					)} pour obtenir un ${upFirstLetter(pokemon.infos.evolution.name)}.`;
		}
		const footer = 'Nombre de ' + upFirstLetter(namePokemon);
		const embed = createListEmbed(description, title, footer, pokemon.infos.img);
		return { embeds: [embed] };
	} catch (error) {
		console.error('Le Pokémon n’a pas été trouvé.');
	}
}

async function getAvailable(interaction, channelName) {
	try {
		const response = await API.post(`/pokemon/zone`, {
			nameZone: correctNameZone(channelName),
		});

		const isPremium = await getIsPremium(interaction.user.id);
		const pokemonList = response.data;

		if (pokemonList.length === 0) {
			return `Il n'y a pas de Pokémon disponible dans cette zone.`;
		}

		const title = `Les Pokémon disponibles dans cette zone.`;
		let footer = ``;
		if (!isPremium) {
			footer = `💎 Pour obtenir les taux de spawn précis, devenez membre Premium ! 💎`;
		}
		const thumbnailUrl = interaction.user.displayAvatarURL({ format: 'png', dynamic: true });

		let embed = createListEmbed(
			pokemonList.map(
				(pokemon) => `- ${upFirstLetter(pokemon.name)} : ${isPremium ? pokemon.spawnChance / 10 : '??'}%`
			),
			title,
			footer,
			thumbnailUrl,
			null,
			'#6B8E23',
			false
		);

		return { embeds: [embed] };
	} catch (error) {
		console.error(error);
	}
}

async function getZoneForPokemon(trainerId, namePokemon) {
	try {
		const response = await API.get(`/zone/pokemon/${namePokemon}`);
		let zones = response.data;

		const isPremium = await getIsPremium(trainerId);
		console.dir(zones, { depth: null, colors: true });

		if (zones.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n’est pas un Pokémon.`;
		}

		// UPDATE GENERATION
		// Cas Pokémon introuvables
		if (
			['mew', 'celebi', 'jirachi', 'phione'].includes(namePokemon.toLowerCase())
		) {
			const title = 'Personne ne sait où se trouve ' + upFirstLetter(namePokemon) + '.';
			const embed = createListEmbed([], title, '', zones.pokemon.img, null, '#6B8E23', false);
			return { embeds: [embed] };
		}

		// Définir le titre
		const title = zones.result.length === 0
			? `${upFirstLetter(zones.pokemon.name)} est seulement disponible par évolution.`
			: `Liste des zones pour ${upFirstLetter(zones.pokemon.name)}`;

		// Fonction utilitaire pour nom lisible
		function formatZoneName(name) {
			return name
				.split('-')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
		}

		// Construction du texte par région
		const allZone = zones.result.map(region => {
			const zoneList = region.zones
				.map(zone => `- ${formatZoneName(zone.name)} : ${isPremium ? zone.spawnChance / 10 : '??'}%`)
				.join('\n');

			return `**${region.name}**\n${zoneList}`;
		}).join('\n\n');

		// Footer si non premium
		let footer = '';
		if (!isPremium) {
			footer = ` 💎 Pour obtenir les taux de spawn précis, devenez membre Premium ! 💎`;
		}

		// Embed final
		const thumbnailUrl = zones.pokemon.img;
		const embed = createListEmbed(allZone, title, footer, thumbnailUrl, null, '#6B8E23', false);
		return { embeds: [embed] };

	} catch (error) {
		console.error('Error retrieving zones.', error);
	}
}

async function shinyLuck(trainerId, pokemonName) {
	try {
		if (!(await getIsPremium(trainerId))) {
			const { embeds, files, components } = await premiumEmbed();
			return { embeds, files, components };
		}
		const response = await API.post(`/pokemon/shiny-luck`, {
			pokemonName: pokemonName,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} n’est pas un Pokémon.`;
		}
		if (response.data.status === 'noShinyRate') {
			return `${upFirstLetter(
				pokemonName
			)} n'est pas un Pokémon sauvage, il n'a donc pas de taux de chance d'être shiny.`;
		}
		if (response.data.status === 'shiny') {
			let embed = createListEmbed(
				`${upFirstLetter(pokemonName)} a ${response.data.shinyRate / 10}% de chance d'être shiny. ✨`,
				`Chance de shiny :`,
				null,
				response.data.imgShiny,
				null,
				'#ffed00'
			);
			return { embeds: [embed] };
		}
	} catch (error) {
		console.error('Error retrieving shiny luck.');
	}
}

async function catchLuck(interaction) {
	try {
		if (!(await getIsPremium(interaction.user.id))) {
			const { embeds, files, components } = await premiumEmbed(interaction.user.id);
			return { embeds, files, components };
		}
		const pokemonName = interaction.options.getString('nom').toLowerCase();
		const response = await API.post(`/pokemon/catch-luck`, {
			pokemonName: pokemonName,
		});
		if (response.data.status === 'noExistPokemon') {
			return `${upFirstLetter(pokemonName)} n’est pas un Pokémon.`;
		}
		if (response.data.status === 'noCatchRate') {
			return `${upFirstLetter(
				pokemonName
			)} n'est pas un Pokémon sauvage, il n'a donc pas de taux de chance d'être capturé.`;
		}
		let message = '';
		const pokeballData = response.data.pokeballData;
		const pokemonData = response.data.pokemonData;

		for (let i = 0; i < pokeballData.length; i++) {
			const customEmoji = interaction.guild.emojis.cache.find(
				(emoji) => emoji.name === pokeballData[i].name
			);
			message += `- ${customEmoji ? customEmoji.toString() : ''} ${upFirstLetter(
				pokeballData[i].name
			)} : ${pokemonData.catchRate + pokeballData[i].catchBonus > 100
				? 100
				: pokemonData.catchRate + pokeballData[i].catchBonus <= 0
					? 1
					: pokemonData.catchRate + pokeballData[i].catchBonus
				}%\n`;
		}

		message += '- 🏃 Fuites : ' + pokemonData.escapeRate + '%';

		let embed = createListEmbed(
			message,
			`Chances de capture pour ${upFirstLetter(pokemonName)} :`,
			null,
			pokemonData.img,
			null,
			'#6B8E23'
		);

		return { embeds: [embed] };
	} catch (error) {
		console.error('Error retrieving catch luck.');
	}
}

async function checkAndSpawnPokemon(guild) {
	try {
		await guild.channels.fetch(); // recharge les salons

		const forumNames = ['🗺️・kanto', "🗺️・johto", "🗺️・hoenn", "🗺️・sinnoh"];

		const forums = guild.channels.cache.filter(
			(c) => c.type === ChannelType.GuildForum && forumNames.includes(c.name)
		);

		for (const forum of forums.values()) {
			try {
				const threads = await forum.threads.fetchActive();

				for (const thread of threads.threads.values()) {
					try {
						const lastMessages = await thread.messages.fetch({ limit: 1 });
						const lastMessage = lastMessages.first();

						if (
							lastMessage &&
							lastMessage.author.id === guild.client.user.id &&
							lastMessage.embeds.length > 0 &&
							lastMessage.embeds[0].title?.includes("sauvage apparaît")
						) {
							continue; // spawn déjà présent
						}

						await spawnRandomPokemon(thread);
					} catch (err) {
						console.error(`❌ Erreur dans le thread ${thread.name} de ${guild.name}`, err);
					}
				}
			} catch (err) {
				console.error(`❌ Erreur avec le forum ${forum.name} de ${guild.name}`, err);
			}
		}
	} catch (err) {
		console.error(`❌ Erreur avec le serveur ${guild.name}`, err);
	}
}


export {
	findRandomPokemon,
	evolvePokemon,
	clearOldWildPokemon,
	nbPokemon,
	getAvailable,
	getZoneForPokemon,
	spawnPokemonWithRune,
	shinyLuck,
	catchLuck,
	spawnRandomPokemon,
	checkAndSpawnPokemon
};
