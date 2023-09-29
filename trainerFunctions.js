import axios from 'axios';

const balls = [
	{ name: 'pokeball', id: 1 },
	{ name: 'superball', id: 2 },
	{ name: 'hyperball', id: 3 },
	{ name: 'masterball', id: 4 },
];

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNombreAvecSeparateur(n) {
	return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

async function addTrainer(member) {
	try {
		const response = await axios.get(
			'http://localhost:5000/trainer/verify/' + member.id
		);
		if (!response.data.hasAccount) {
			await axios.post('http://localhost:5000/trainer', {
				trainer: {
					idDiscord: member.id,
					name: member.user.username,
					money: 1000,
					point: 0,
					level: 0,
				},
				ball: [
					{
						id: 1,
						quantity: 10,
					},
					{
						id: 2,
						quantity: 5,
					},
					{
						id: 3,
						quantity: 1,
					},
				],
			});
		}
	} catch (error) {
		console.error(error);
	}
}

async function getBallTrainer(message) {
	try {
		const response = await axios.get(
			'http://localhost:5000/pokeball/trainer/' + message.member.id
		);
		let strResponse = 'Vous avez : \n';
		for (let i = 0; i < response.data.length; i++) {
			const customEmoji = message.guild.emojis.cache.find(
				(emoji) => emoji.name === response.data[i].name
			);
			strResponse +=
				'- ' +
				(customEmoji ? customEmoji.toString() : '') +
				' : ' +
				response.data[i].quantity +
				'\n';
		}
		return strResponse;
	} catch (error) {
		console.error(error);
	}
}

async function getPokedex(idTrainer) {
	try {
		const response = await axios.get(
			'http://localhost:5000/pokemon/trainer/' + idTrainer
		);
		console.log(response.data);
		if (response.data.pokemon.length === 0) {
			return "Vous n'avez pas encore de pokémon.";
		}
		let strResponse = `Vous avez ${response.data.sumPokemon} pokémon, dont ${response.data.countPokemon} différents.\nVotre pokedex : \n`;
		for (let i = 0; i < response.data.pokemon.length; i++) {
			strResponse += `- ${response.data.pokemon[i].quantity} ${response.data.pokemon[i].name}\n`;
		}
		return strResponse;
	} catch (error) {
		console.error(error);
	}
}

async function getMoney(idTrainer) {
	try {
		const response = await axios.get(
			'http://localhost:5000/trainer/' + idTrainer
		);
		return (
			'Vous avez : ' +
			formatNombreAvecSeparateur(response.data.money) +
			' pokédollars.'
		);
	} catch (error) {
		console.error(error);
	}
}

async function priceBall(idBall) {
	try {
		const response = await axios.get(
			'http://localhost:5000/pokeball/' + idBall
		);
		return `Le prix d'une ${capitalizeFirstLetter(
			response.data.name
		)} est de ${formatNombreAvecSeparateur(
			response.data.buyingPrice
		)} pokédollars.`;
	} catch (error) {
		console.error("La pokéball n'existe pas.");
	}
}

async function pricePokemon(namePokemon) {
	try {
		const response = await axios.post('http://localhost:5000/pokemon/info', {
			namePokemon: namePokemon,
		});
		let pokemon = response.data;
		if (pokemon.status === 'noExistPokemon') {
			return `${capitalizeFirstLetter(
				namePokemon
			)} n'est ni un pokémon, ni une pokeball.`;
		} else {
			return `Le prix de vente d'un ${capitalizeFirstLetter(
				namePokemon
			)} est de ${formatNombreAvecSeparateur(
				pokemon.infos.sellPrice
			)} pokédollars.`;
		}
	} catch (error) {
		console.error("Le pokémon n'existe pas.");
	}
}

async function getPrice(item) {
	const isPokeball = balls.some((ball) => ball.name === item);
	if (isPokeball) {
		const ball = balls.find((ball) => ball.name === item);
		return await priceBall(ball.id);
	} else {
		return await pricePokemon(item);
	}
}

async function nbPokemon(namePokemon) {
	try {
		const response = await axios.post('http://localhost:5000/pokemon/info', {
			namePokemon: namePokemon,
		});
		let pokemon = response.data;
		if (pokemon.status === 'noExistPokemon') {
			return `${capitalizeFirstLetter(namePokemon)} n'est pas un pokémon`;
		} else if (pokemon.infos.numberEvolution === null) {
			return `${capitalizeFirstLetter(namePokemon)} n'a pas d'évolution.`;
		} else {
			return `Il vous faut ${
				pokemon.infos.numberEvolution
			} ${capitalizeFirstLetter(
				namePokemon
			)} pour faire évoluer votre pokémon.`;
		}
	} catch (error) {
		console.error("Le pokémon n'existe pas.");
	}
}

async function buyBall(idTrainer, idBall, quantity, nameBall) {
	try {
		const response = await axios.post('http://localhost:5000/pokeball/buy', {
			idDiscord: idTrainer,
			idBall: idBall,
			quantity: quantity,
		});
		if (response.data.status === 'noMoney') {
			return "Vous n'avez pas assez d'argent.";
		} else if (response.data.status === 'buy') {
			return (
				'Vous avez acheté ' +
				quantity +
				' ' +
				capitalizeFirstLetter(nameBall) +
				' pour ' +
				formatNombreAvecSeparateur(response.data.price) +
				' pokédollars.'
			);
		} else if (response.data.status === 'noExistBall') {
			return (
				capitalizeFirstLetter(nameBall) +
				" n'est pas une pokéball.\n" +
				'Veuillez réessayer avec la commande :\n!buy [quantité] [nom de la pokéball]'
			);
		}
	} catch (error) {
		console.error(error);
	}
}

async function getBadge(
	message,
	nbPokemon,
	nbPokemonDiff,
	nameBadge,
	roleBadge
) {
	let idTrainer = message.member.id;
	try {
		const response = await axios.get(
			'http://localhost:5000/pokemon/trainer/' + idTrainer
		);
		if (response.data.sumPokemon < nbPokemon) {
			return message.reply(
				`Vous n'avez pas assez de pokémon pour obtenir le badge ${nameBadge}.`
			);
		}
		if (response.data.countPokemon < nbPokemonDiff) {
			return message.reply(
				`Vous n'avez pas assez de pokémon différents pour obtenir le badge ${nameBadge}.`
			);
		}
	} catch (error) {
		console.error(error);
	}
	let badgeRole = message.guild.roles.cache.find(
		(role) => role.name === roleBadge
	);

	if (badgeRole) {
		if (message.member.roles.cache.has(badgeRole.id)) {
			return message.reply(`Vous avez déjà le badge ${nameBadge}.`);
		}
		message.member.roles.add(badgeRole).catch(console.error);
		return message.reply(`Vous avez reçu le badge ${nameBadge} !`);
	}
}

export {
	addTrainer,
	getBallTrainer,
	getPokedex,
	getMoney,
	buyBall,
	getBadge,
	getPrice,
	nbPokemon,
};
