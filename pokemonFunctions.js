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

export { findRandomPokemon };
