import { EventEmitter } from 'events';

export class Server extends EventEmitter {
    constructor(diffStateFn) {
        super();

        this.diffStateFn = diffStateFn;
        this.lastState = null;

        this.idCounter = 1;
    }

    publish(state) {
        const id = this.idCounter++;

        if(this.lastState == null) {
            this.emit('sendData', { id, state });
        }
        else {
            this.emit('sendData', { id, diff: this.diffStateFn(state, this.lastState) });
        }

        this.lastState = state;
    }
}

export class Client extends EventEmitter {
    constructor(applyStateFn) {
        super();

        this.lastState = null;

        this.on('data', data => {
            const state = this.lastState != null ?
                applyStateFn(this.lastState, data.diff) :
                data.state;

            this.emit('newState', state);

            this.lastState = state;
        });
    }
}
