import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';
import { upFirstLetter, createListEmbed } from './globalFunctions.js';

async function findRandomPokemon(interaction, type) {
	try {
		const randomPokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/wild`,
			{
				nameZone: interaction.channel.name,
				spawnType: type,
			}
		);
		if (randomPokemon.data.length === 0) {
			return type === 'herbe'
				? 'Il n y a pas de pokémon sauvage dans cette zone.'
				: 'Il n y a pas de zone de pêche dans cette zone.';
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
		const embed = new EmbedBuilder()
			.setTitle(`Un ${pokemon.name + star} sauvage apparaît !`)
			.setDescription('Attrapez-le !')
			.setThumbnail(pokemon.isShiny ? pokemon.imgShiny : pokemon.img)
			.setColor('#FFFFFF');

		return {
			embeds: [embed],
			components: [row],
		};
	} catch (error) {
		console.error(error);
	}
}

async function spawnPokemonWithRune(interaction) {
	const idTrainer = interaction.user.id;
	const pokemonName = interaction.options.getString('nom');
	try {
		const pokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/rune/use`,
			{
				idTrainer: idTrainer,
				pokemonName: pokemonName,
			}
		);
		if (pokemon.data.status === 'noRune') {
			return `Vous n'avez pas de rune de ${upFirstLetter(pokemonName)}.`;
		}
		let pokemonSpawn = pokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === ball);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemonSpawn.catchCode)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});
		let img = pokemonSpawn.isShiny ? pokemonSpawn.imgShiny : pokemonSpawn.img;
		let star = pokemonSpawn.isShiny ? '✨' : '';
		const embed = createListEmbed(
			'Attrapez-le !',
			`Vous avez fait apparaître un ${pokemonSpawn.name + star}!`,
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

async function evolvePokemon(idTrainer, namePokemon, isShiny) {
	try {
		const evolvePokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/evolve`,
			{
				namePokemon: namePokemon,
				idTrainer: idTrainer,
				isShiny: isShiny,
			}
		);
		const pokemon = evolvePokemon.data;
		if (pokemon.status === 'noPokemon') {
			return (
				'Il vous faut au minimum ' +
				pokemon.numberPokemon +
				' ' +
				upFirstLetter(namePokemon) +
				' pour le faire évoluer.'
			);
		} else if (pokemon.status === 'evolve') {
			let star = pokemon.isShiny ? '✨' : '';
			const embed = new EmbedBuilder()
				.setTitle(
					`Vous avez fait évoluer ${upFirstLetter(namePokemon) + star} en ${
						pokemon.pokemonEvolve.name + star
					} !`
				)
				.setDescription('Félicitations ! Vous avez obtenu un nouveau pokémon !')
				.setThumbnail(pokemon.isShiny ? pokemon.pokemonEvolve.imgShiny : pokemon.pokemonEvolve.img)
				.setFooter({
					text: 'Evolution de ' + upFirstLetter(namePokemon),
				})
				.setTimestamp()
				.setColor('#FFFFFF');
			return { embeds: [embed] };
		} else if (pokemon.status === 'noEvolution') {
			return upFirstLetter(namePokemon) + " n'a pas d'évolution.";
		} else if (pokemon.status === 'noExistPokemon') {
			return upFirstLetter(namePokemon) + " n'est pas un pokémon.";
		} else {
			return "Erreur lors de l'évolution du pokémon.";
		}
	} catch (error) {
		console.error("Erreur lors de l'évolution du pokémon.");
	}
}

async function clearOldWildPokemon() {
	try {
		await axios.delete(`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/wild`);
	} catch (error) {
		console.error(error);
	}
}

async function nbPokemon(namePokemon) {
	try {
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/info`,
			{ namePokemon }
		);
		let pokemon = response.data;

		if (pokemon.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n'est pas un pokémon`;
		}

		const title =
			pokemon.infos.numberEvolution === null
				? `${upFirstLetter(namePokemon)} ne peut pas évoluer.`
				: `Il vous faut ${pokemon.infos.numberEvolution} ${upFirstLetter(
						namePokemon
				  )} pour le faire évoluer en ${upFirstLetter(pokemon.infos.evolution.name)}.`;
		const footer = 'Nombre de ' + upFirstLetter(namePokemon);
		const embed = createListEmbed(null, title, footer, pokemon.infos.img);
		return { embeds: [embed] };
	} catch (error) {
		console.error("Le pokémon n'existe pas.");
	}
}

async function getAvailable(channelName) {
	try {
		const response = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/zone`,
			{
				nameZone: channelName,
			}
		);

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
			return "dans l'herbe";
		case 'canne':
			return 'à la canne';
		case 'superCanne':
			return 'à la super canne';
		case 'megaCanne':
			return 'à la méga canne';
		default:
			return type;
	}
}

async function getZoneForPokemon(namePokemon) {
	try {
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/zone/pokemon/${namePokemon}`
		);
		let zones = response.data;

		if (zones.status === 'noExistPokemon') {
			return `${upFirstLetter(namePokemon)} n'est pas un pokémon.`;
		}

		let title =
			zones.result.length === 0
				? `${upFirstLetter(zones.pokemon.name)} est disponible seulement par évolution.`
				: `Liste des zones pour ${upFirstLetter(zones.pokemon.name)}`;

		let allZone = zones.result.map((zone) => `- ${upFirstLetter(zone.name)}`);

		if (namePokemon.toLowerCase() === 'mew') {
			title = 'Personne ne sait où se trouve Mew.';
			allZone = [];
		}

		const footer = upFirstLetter(zones.pokemon.name);
		const thumbnailUrl = zones.pokemon.img;

		let embed = createListEmbed(allZone, title, footer, thumbnailUrl);
		return { embeds: [embed] };
	} catch (error) {
		console.error("Erreur lors de l'obtention des zones.");
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
