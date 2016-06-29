# game-state-sync
Tools for keeping clients in sync with server game state

## Installing
`npm install game-state-sync`

## Example usage
### Same process
```js
var gss = require('game-state-sync');

var server = new gss.reliable.Server();
var client = new gss.reliable.Client();

// Link server and client together.
// 'data' is JSON-serializable (provided the published state also is)
server.on('sendData', (data) => {
    client.emit('data', data);
});

client.on('sendData', (data) => {
    server.emit('data', data);
});

// Start publishing
client.on('newState', (state) => {
    console.log(state); // --> { number: 42 }
});

server.publish({ number: 42 });
```

### TCP
#### Server
```js
var net = require('net');
var ndjson = require('ndjson');
var gss = require('game-state-sync');

net.createServer((socket) => {
    // Set up streams
    var stringify = ndjson.stringify();
    var parse = ndjson.parse();

    stringify.pipe(socket).pipe(parse);

    // Create and link up Server instance
    var server = new gss.reliable.Server();

    server.on('sendData', (data) => {
        stringify.write(data);
    });
    parse.on('data', (data) => {
        server.emit('data', data);
    });

    // Publish some state to this client
    var counter = 1;
    setInterval(() => {
        server.publish({ number: counter++ });
    }, 1000);
})
.listen(22000)
```

#### Client
```js
var net = require('net');
var ndjson = require('ndjson');
var gss = require('game-state-sync');

// Set up streams
var stringify = ndjson.stringify();
var parse = ndjson.parse();
var socket = net.connect(22000, 'localhost');

stringify.pipe(socket).pipe(parse);

// Create and link up Client instance
var client = new gss.reliable.Client();

client.on('sendData', (data) => {
    stringify.write(data);
});
parse.on('data', (data) => {
    client.emit('data', data);
});

// Receive states from server
client.on('newState', (state) => {
    console.log(state);
    // --> { number: [num] }, where [num] starts at 1 and increases by 1
});
```
