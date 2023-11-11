import axios, { all } from 'axios';
import { EmbedBuilder } from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';
import { capitalizeFirstLetter } from './globalFunctions.js';

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
				.setCustomId(ball + '|' + pokemon.catchCode)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](customEmoji ? customEmoji.id : ball);

			row.addComponents(button);
		});

		const embed = new EmbedBuilder()
			.setTitle(`Un ${pokemon.name} sauvage apparaît !`)
			.setDescription('Attrapez-le !')
			.setThumbnail(pokemon.img)
			.setColor('#FFFFFF');

		return {
			embeds: [embed],
			components: [row],
		};
	} catch (error) {
		console.error(error);
	}
}

async function evolvePokemon(idTrainer, namePokemon) {
	try {
		const evolvePokemon = await axios.post(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/pokemon/evolve`,
			{
				namePokemon: namePokemon,
				idTrainer: idTrainer,
			}
		);
		if (evolvePokemon.data.status === 'noPokemon') {
			return (
				'Il vous faut au minimum ' +
				evolvePokemon.data.numberPokemon +
				' ' +
				capitalizeFirstLetter(namePokemon) +
				' pour le faire évoluer.'
			);
		} else if (evolvePokemon.data.status === 'evolve') {
			const embed = new EmbedBuilder()
				.setTitle(
					`Vous avez fait évoluer ${capitalizeFirstLetter(namePokemon)} en ${
						evolvePokemon.data.pokemonName
					} !`
				)
				.setImage(evolvePokemon.data.pokemonImg)
				.setColor('#FFFFFF');
			return { embeds: [embed] };
		} else if (evolvePokemon.data.status === 'noEvolution') {
			return capitalizeFirstLetter(namePokemon) + " n'a pas d'évolution.";
		} else if (evolvePokemon.data.status === 'noExistPokemon') {
			return capitalizeFirstLetter(namePokemon) + " n'est pas un pokémon.";
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
			{
				namePokemon: namePokemon,
			}
		);
		let pokemon = response.data;
		if (pokemon.status === 'noExistPokemon') {
			return `${capitalizeFirstLetter(namePokemon)} n'est pas un pokémon`;
		} else if (pokemon.infos.numberEvolution === null) {
			return `${capitalizeFirstLetter(namePokemon)} n'a pas d'évolution.`;
		} else {
			return `Il vous faut ${pokemon.infos.numberEvolution} ${capitalizeFirstLetter(
				namePokemon
			)} pour faire évoluer votre pokémon.`;
		}
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
		if (namePokemon === 'mew') {
			return 'Personne ne sait où se trouve Mew. :person_shrugging:';
		}
		const response = await axios.get(
			`${process.env.VITE_BACKEND_URL ?? 'http://localhost:5000'}/zone/pokemon/${namePokemon}`
		);
		let zones = response.data;
		if (zones.status === 'noExistPokemon') {
			return capitalizeFirstLetter(namePokemon) + " n'est pas un pokémon.";
		} else if (zones.result.length === 0) {
			return capitalizeFirstLetter(namePokemon) + ' est disponible seulement par évolution.';
		} else {
			let allZone = [];
			for (let i = 0; i < zones.result.length; i++) {
				allZone.push(capitalizeFirstLetter(zones.result[i].name));
			}
			return `${capitalizeFirstLetter(namePokemon)} est disponible dans ${
				allZone.length === 1 ? 'la zone' : 'les zones suivantes'
			} :\n- ${allZone.join('\n- ')}.`;
		}
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
};
