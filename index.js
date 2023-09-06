import dotenv from 'dotenv';
import { clientPokechat, clientPierre } from './varClients.js';

import botPierre from './arenaTrainer/pierre.js';
import pokeChat from './pokechat.js';

dotenv.config();

pokeChat(clientPokechat);
botPierre(clientPierre);
