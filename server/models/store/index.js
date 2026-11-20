// Escolhe onde os dados ficam: MySQL se estiver configurado no .env, senão memória.
import { config } from '../../config.js';
import { memoriaStore } from './memoriaStore.js';
import { mysqlStore } from './mysqlStore.js';

export const store = config.banco ? mysqlStore : memoriaStore;
