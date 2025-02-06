import { ActionRowBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder } from 'discord.js';
import { upFirstLetter, createListEmbed, API, correctNameZone } from './globalFunctions.js';
import { XEmbed, GamsGoEmbed } from './adsEmbed.js';

let commandCount = 0;
let embedIndex = 0;

const embedFunctions = [XEmbed, GamsGoEmbed];

async function findRandomPokemon(interaction, type, followUp = false) {
	commandCount++;
	if (!interaction.replied && !interaction.deferred) {
		await interaction.deferReply();
	}
	try {
		const randomPokemon = await API.post(`/pokemon/wild`, {
			nameZone: correctNameZone(interaction.channel.name),
			spawnType: type,
		});
		if (randomPokemon.data.length === 0) {
			const noPokemonMessage =
				type === 'herbe'
					? "Il n'y a pas de Pokémon sauvage dans cette zone."
					: "Il n'y a pas de Pokémon disponible à la pêche dans cette zone.";

			return await interaction.editReply({ content: noPokemonMessage, ephemeral: true });
		}
		let pokemon = randomPokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemon.idPokemonWild + '|' + type)
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
			const { embed: extraEmbed, attachment: extraAttachment } =
				embedFunctions[embedIndex % embedFunctions.length](color);
			responseOptions.embeds.push(extraEmbed);
			if (extraAttachment) {
				if (!responseOptions.files) responseOptions.files = [];
				responseOptions.files.push(extraAttachment);
			}
			embedIndex++;
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
					`Vous avez fait évoluer ${pokemon.quantity * pokemon.pokemonPreEvolve.numberEvolution} ${
						upFirstLetter(namePokemon) + star
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

async function getAvailable(channelName) {
	try {
		const response = await API.post(`/pokemon/zone`, {
			nameZone: correctNameZone(channelName),
		});

		const pokemonsBySpawnType = response.data.reduce((acc, pokemon) => {
			if (!acc[pokemon.spawnType]) {
				acc[pokemon.spawnType] = [];
			}
			acc[pokemon.spawnType].push(pokemon.name);
			return acc;
		}, {});

		const spawnOrder = ['herbe', 'canne', 'superCanne', 'megaCanne'];
		const messages = [];

		for (const spawnType of spawnOrder) {
			if (pokemonsBySpawnType[spawnType]) {
				messages.push(
					`Les Pokémon suivants sont disponibles ${spawnTypeTranslation(
						spawnType
					)} :\n- ${pokemonsBySpawnType[spawnType].join('\n- ')}.`
				);
			}
		}

		return messages.join('\n\n');
	} catch (error) {
		console.error(error);
	}
}

function spawnTypeTranslation(type) {
	switch (type) {
		case 'herbe':
			return 'dans les herbes';
		case 'canne':
			return 'avec la canne';
		case 'superCanne':
			return 'avec la super canne';
		case 'megaCanne':
			return 'avec la méga canne';
		default:
			return type;
	}
}

async function getZoneForPokemon(namePokemon) {
	try {
		const response = await API.get(`/zone/pokemon/${namePokemon}`);
		let zones = response.data;

		if (zones.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n’est pas un Pokémon.`;
		}

		let title =
			zones.result.length === 0
				? `${upFirstLetter(zones.pokemon.name)} est seulement disponible par évolution.`
				: `Liste des zones pour ${upFirstLetter(zones.pokemon.name)}`;

		let allZone = zones.result.map((zone) => `- ${upFirstLetter(zone.name)}`);

		if (namePokemon.toLowerCase() === 'mew' || namePokemon.toLowerCase() === 'celebi') {
			title = 'Personne ne sait où se trouve ' + upFirstLetter(namePokemon) + '.';
			allZone = [];
		}

		const footer = upFirstLetter(zones.pokemon.name);
		const thumbnailUrl = zones.pokemon.img;

		let embed = createListEmbed(allZone, title, footer, thumbnailUrl, null, '#6B8E23');
		return { embeds: [embed] };
	} catch (error) {
		console.error('Error retrieving zones.');
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
};
