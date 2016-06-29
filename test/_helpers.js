import jsv from 'jsverify';
import shuffleArray from 'shuffle-array';

export function link(server, client) {
    server.on('sendData', data =>
        setImmediate(() => client.emit('data', data))
    );
    client.on('sendData', data =>
        setImmediate(() => server.emit('data', data))
    );
}

export function linkUnreliable(server, client, serverDataCount) {
    const serverData = [];
    server.on('sendData', data => {
        serverData.push(data);

        if(serverData.length == serverDataCount) {
            shuffleArray(serverData, { rng: () => jsv.random.number(0, 1) });

            setImmediate(() => {
                for(const data of serverData) {
                    client.emit('data', data);
                }
            });
        }
    });

    client.on('sendData', data => {
        server.emit('data', data);
    });
}
