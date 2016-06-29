import { EventEmitter } from 'events';
import _ from 'lodash';

function findStateById(dataHistory, id) {
    return _.find(dataHistory, data => data.id == id).state;
}

function filterOldDatas(dataHistory, id) {
    return dataHistory.filter(dh => dh.id >= id);
}

export class Server extends EventEmitter {
    constructor(diffStateFn) {
        super();
        this.diffStateFn = diffStateFn;

        this.idCounter = 1;
        this.lastReceivedId = -1;

        this.dataHistory = [];

        this.on('data', data => {
            // Handle potential duplicate and/or out-of-order packets
            if(data.lastReceivedId <= this.lastReceivedId) return;
            this.lastReceivedId = data.lastReceivedId;

            this.dataHistory = filterOldDatas(this.dataHistory, this.lastReceivedId);
        });
    }

    publish(state) {
        const id = this.idCounter++;

        this.dataHistory.push({ id, state });

        const outData = { id };
        if(this.lastReceivedId < 0) {
            outData.state = state;
        }
        else {
            outData.basedOnId = this.lastReceivedId;
            outData.diff = this.diffStateFn(
                state, findStateById(this.dataHistory, this.lastReceivedId)
            );
        }
        this.emit('sendData', outData);
    }
}

export class Client extends EventEmitter {
    constructor(applyStateFn) {
        super();
        this.applyStateFn = applyStateFn;

        this.lastId = -1;
        this.dataHistory = [];

        this.on('data', ::this.onData);
    }

    onData(data) {
        if(data.id <= this.lastId) return;
        this.lastId = data.id;

        const state = (data.state != null) ? data.state :
            this.applyStateFn(
                findStateById(this.dataHistory, data.basedOnId), data.diff
            );

        this.dataHistory = filterOldDatas(this.dataHistory, data.basedOnId || 1);
        this.dataHistory.push({ id: data.id, state });

        this.emit('newState', state);
        this.emit('sendData', { lastReceivedId: data.id });
    }
}
