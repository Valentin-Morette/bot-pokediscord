import dotenv from 'dotenv';
import {
	clientPokechat,
	clientPierre,
	clientOndine,
	clientMajorBob,
	clientErika,
	clientKoga,
	clientMorgane,
	clientAuguste,
	clientGiovanni,
} from './varClients.js';

import botPierre from './arenaTrainer/pierre.js';
import botOndine from './arenaTrainer/ondine.js';
import botMajorBob from './arenaTrainer/majorBob.js';
import botErika from './arenaTrainer/erika.js';
import botKoga from './arenaTrainer/koga.js';
import botMorgane from './arenaTrainer/morgane.js';
import botAuguste from './arenaTrainer/auguste.js';
import botGiovanni from './arenaTrainer/giovanni.js';
import pokeChat from './pokechat.js';

dotenv.config();

pokeChat(clientPokechat);
botPierre(clientPierre);
botOndine(clientOndine);
botMajorBob(clientMajorBob);
botErika(clientErika);
botKoga(clientKoga);
botMorgane(clientMorgane);
botAuguste(clientAuguste);
botGiovanni(clientGiovanni);
