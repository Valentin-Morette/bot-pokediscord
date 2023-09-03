import axios from 'axios';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
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
					money: 0,
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
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

export { addTrainer, getBallTrainer, getPokedex };
