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

export { findRandomPokemon, catchPokemon };
