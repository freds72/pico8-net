const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

var args = process.argv.slice(2);
var port = parseInt(args[0]);
args = args.slice(1);

// keeps track of who's connected
var states = {
  server_ready: false,
  server_state: null,
  client_ready: false,
  client_state: null
};

// start server
const server = net.createServer((client) => {
  // 'connection' listener.
  console.log('client connected');

  // spawns pico8
  // args 0: exe location
  // args 1: home
  // args 2: cart name
  const pico8 = spawn(args[0], ['-home',args[1],'-p','server','-run',path.join(args[1],'carts',args[2])]);

  pico8.stderr.on('data', (data) => {
    console.error(`[PICO8] error: ${data}`);
  });

  pico8.stdout.on('data',(data) => {
    states.server_state = data;
    if(!states.server_ready) {
      states.server_ready = true;
      // initial data is garbage (for now)
      states.server_state = null;
      console.log("PICO ready");
    }
    // we received something
    // must send something to unlock message pump
    var client_state = states.client_state;
    if(!client_state) {
      client_state = Buffer.alloc(5);
    }

    pico8.stdin.write(client_state);
    states.client_state = null;
  });

  client.on('data',(data) => {
    states.client_state = data;
    if(!states.client_ready) {
      states.client_ready = true;
      // initial data is garbage (for now)
      states.client_state = null;
      console.log("PICO (remote) ready");
    }

    // we received something
    // must send something to unlock message pump
    var server_state = states.server_state;
    if(!server_state) {
      server_state = Buffer.alloc(5);
    }

    client.write(server_state);
    // clear after send
    states.server_state = null;
  });
  
  pico8.on('close', (code) => {
    console.log(`PICO8 process exited with code ${code}`);
    server.close();
  });

  client.on('end', () => {
    console.log('client disconnected');
  });
});
server.on('error', (err) => {
  throw err;
});
server.listen(port, () => {
  console.log(`Server bound to: ${port}`);
});
