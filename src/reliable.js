import { EventEmitter } from 'events';

export class Server extends EventEmitter {
    constructor() {
        super();

        this.idCounter = 1;
    }

    publish(state) {
        const id = this.idCounter++;

        this.emit('sendData', { id, state });
    }
}

export class Client extends EventEmitter {
    constructor() {
        super();

        this.on('data', data => {
            this.emit('newState', data.state);
        });
    }
}
