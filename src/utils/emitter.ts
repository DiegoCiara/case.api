// events.js
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

// Define o limite de listeners como infinito
eventEmitter.setMaxListeners(Infinity);

export default eventEmitter;