import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { ButtonBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonStyle } from 'discord.js';

async function findRandomPokemon(message, type) {
	try {
		const randomPokemon = await axios.post(
			'http://localhost:5000/pokemon/wild',
			{
				nameZone: message.channel.name,
				spawnType: type,
			}
		);
		if (randomPokemon.data.length === 0) {
			message.channel.send(
				type === 'herbe'
					? 'Il n y a pas de pokémon sauvage dans cette zone.'
					: 'Il n y a pas de zone de pêche dans cette zone.'
			);
			return;
		}
		let pokemon = randomPokemon.data;
		let balls = ['pokeball', 'superball', 'hyperball', 'masterball'];
		let row = new ActionRowBuilder();
		balls.forEach((ball) => {
			const customEmoji = message.guild.emojis.cache.find(
				(emoji) => emoji.name === ball
			);
			const button = new ButtonBuilder()
				.setCustomId(ball + '|' + pokemon.catchCode)
				.setStyle(ButtonStyle.Secondary);
			button[customEmoji ? 'setEmoji' : 'setLabel'](
				customEmoji ? customEmoji.id : ball
			);

			row.addComponents(button);
		});

		const embed = new EmbedBuilder()
			.setTitle(`Un ${pokemon.name} sauvage apparaît !`)
			// .setDescription(`Tapez !pokeball ${pokemon.catchCode} pour le capturer !`)
			.setImage(pokemon.img)
			.setColor('#FFFFFF');
		message.channel.send({ embeds: [embed], components: [row] });
	} catch (error) {
		console.error(error);
	}
}

async function catchPokemon(catchCode, idTrainer, idPokeball) {
	try {
		const catchPokemon = await axios.post(
			'http://localhost:5000/pokemon/catch',
			{
				catchCode: catchCode,
				idTrainer: idTrainer,
				idBall: idPokeball,
			}
		);
		console.log(catchPokemon.data);
		return catchPokemon.data;
	} catch (error) {
		console.error(error);
	}
}

async function sellPokemon(idTrainer, namePokemon, quantity) {
	try {
		const sellPokemon = await axios.post('http://localhost:5000/pokemon/sell', {
			namePokemon: namePokemon,
			idTrainer: idTrainer,
			quantity: quantity,
		});
		if (sellPokemon.data.status === 'noPokemon') {
			return "Vous n'avez pas " + quantity + ' ' + namePokemon + '.';
		} else if (sellPokemon.data.status === 'sell') {
			return (
				'Vous avez vendu ' +
				quantity +
				' ' +
				namePokemon +
				' pour ' +
				sellPokemon.data.sellPrice +
				' pokédollars.'
			);
		} else if (sellPokemon.data.status === 'noExistPokemon') {
			return namePokemon + " n'est pas un pokémon.";
		}
	} catch (error) {
		console.error("Erreur lors de la vente d'un pokémon.");
	}
}

async function evolvePokemon(idTrainer, namePokemon) {
	try {
		const evolvePokemon = await axios.post(
			'http://localhost:5000/pokemon/evolve',
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
				namePokemon +
				' pour le faire évoluer.'
			);
		} else if (evolvePokemon.data.status === 'evolve') {
			return (
				'Vous avez fait évoluer ' +
				namePokemon +
				' en ' +
				evolvePokemon.data.pokemonName +
				'.'
			);
		} else if (evolvePokemon.data.status === 'noEvolution') {
			return namePokemon + " n'a pas d'évolution.";
		} else if (evolvePokemon.data.status === 'noExistPokemon') {
			return (
				namePokemon +
				" n'est pas un pokémon.\n" +
				'Veuillez réessayer avec la commande :\n!evolution [nom du pokémon]'
			);
		} else {
			return "Erreur lors de l'évolution du pokémon.";
		}
	} catch (error) {
		console.error("Erreur lors de l'évolution du pokémon.");
	}
}

export { findRandomPokemon, catchPokemon, sellPokemon, evolvePokemon };
