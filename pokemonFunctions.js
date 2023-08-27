import axios from 'axios';

async function findRandomPokemon(name) {
	try {
		const response = await axios.post('http://localhost:5000/pokemon/zone', {
			nameZone: name,
		});
		const randomPokemon =
			response.data[Math.floor(Math.random() * response.data.length)];
		return randomPokemon;
	} catch (error) {
		console.error(error);
	}
}

export { findRandomPokemon };
