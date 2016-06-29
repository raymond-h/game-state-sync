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

        this.lastId = -1;

        this.on('data', data => {
            if(data.id <= this.lastId) return;
            this.lastId = data.id;

            this.emit('newState', data.state);
        });
    }
}
