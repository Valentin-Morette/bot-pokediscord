import axios from 'axios';

async function findRandomPokemon(name) {
	try {
		const randomPokemon = await axios.post(
			'http://localhost:5000/pokemon/wild',
			{
				nameZone: name,
			}
		);
		if (randomPokemon.data.length === 0) {
			return null;
		}
		return randomPokemon.data;
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

export { findRandomPokemon, catchPokemon, sellPokemon };
