import axios from 'axios';

async function addTrainer(member) {
	try {
		const response = await axios.get(
			'http://localhost:5000/trainer/verify/' + member.id
		);
		if (!response.data.hasAccount) {
			await axios.post('http://localhost:5000/trainer', {
				idDiscord: member.id,
				name: member.user.username,
				money: 0,
				point: 0,
				level: 0,
			});
		}
	} catch (error) {
		console.error(error);
	}
}

export { addTrainer };
