import axios from 'axios';

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
		message.channel.send(
			`Un ${pokemon.name} sauvage apparaît !\nTapez !pokeball ${pokemon.catchCode} pour le capturer !`
		);
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
			return "Vous n'avez pas au minimum " + quantity + ' ' + namePokemon + '.';
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
			return (
				namePokemon +
				" n'est pas un pokémon.\n" +
				'Veuillez réessayer avec la commande :\n!vend [quantité] [nom du pokémon]'
			);
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
		}
	} catch (error) {
		console.error("Erreur lors de l'évolution d'un pokémon.");
	}
}

export { findRandomPokemon, catchPokemon, sellPokemon, evolvePokemon };
