import { clientPokechat } from './varClients.js';
import pokeChat from './pokechat.js';

pokeChat(clientPokechat);

process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import express from 'express';
import bodyParser from 'body-parser';
import stripe from 'stripe';
import { API } from './globalFunctions.js';

const app = express();

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
	const sig = req.headers['stripe-signature'];
	let event;

	try {
		event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error('❌ Webhook Error:', err.message);
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	if (event.type === 'checkout.session.completed') {
		const discordId = event.data.object.metadata.discord_id;
		const email = event.data.object.customer_details.email;
		API.post(`/trainer/premium`, {
			idDiscord: discordId,
			email: email,
		});
	}

	res.status(200).send({ received: true });
});

const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
	console.log(`✅ Webhook Stripe du bot en écoute sur port ${PORT}`);
});
