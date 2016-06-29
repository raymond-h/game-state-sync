import test from 'ava';
import jsv from 'jsverify';

import { link, linkUnreliable } from './_helpers';

import * as reliable from '../src/reliable';
import * as reliableDiff from '../src/reliable-diff';
import * as unreliable from '../src/unreliable';
import * as unreliableDiff from '../src/unreliable-diff';

const nonZeroNat = jsv.nat.smap(
    n => n+1,
    n => n-1
);

export async function stateOrderMacro(t, setup) {
    await jsv.assert(
        jsv.forall(nonZeroNat, async count => {
            const { client, server } = setup(count);

            const states = [];
            for(let i = 1; i <= count; i++) {
                states.push({ num: i });
            }

            const received = await new Promise((resolve) => {
                const received = [];
                client.on('newState', state => {
                    received.push(state);

                    if(received.length === count) resolve(received);
                });

                for(const state of states) {
                    server.publish(state);
                }
            });

            t.true(received.length > 0);

            let lastState = null;
            for(const state of received) {
                t.true(state != null);

                if(lastState != null) {
                    t.true(lastState.num < state.num);
                }

                lastState = state;
            }

            return true;
        })
    );
}

function diffState(state, oldState) {
    return { numDiff: state.num - oldState.num };
}

function applyState(state, diff) {
    return { num: state.num + diff.numDiff };
}

test('reliable state sync', stateOrderMacro, () => {
    const client = new reliable.Client();
    const server = new reliable.Server();

    link(client, server);

    return { client, server };
});

test('reliable diff state sync', stateOrderMacro, () => {
    const client = new reliableDiff.Client(applyState);
    const server = new reliableDiff.Server(diffState);

    link(client, server);

    return { client, server };
});

test('unreliable state sync', stateOrderMacro, (count) => {
    const client = new unreliable.Client();
    const server = new unreliable.Server();

    linkUnreliable(client, server, count);

    return { client, server };
});

test('unreliable diff state sync', stateOrderMacro, (count) => {
    const client = new unreliableDiff.Client(applyState);
    const server = new unreliableDiff.Server(diffState);

    linkUnreliable(client, server, count);

    return { client, server };
});
