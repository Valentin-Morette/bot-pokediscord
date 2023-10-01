import dotenv from 'dotenv';
import { clientPokechat } from './varClients.js';
import pokeChat from './pokechat.js';

dotenv.config();

pokeChat(clientPokechat);
