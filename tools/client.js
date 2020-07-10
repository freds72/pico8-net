const { spawn } = require('child_process');
const net = require('net');

var args = process.argv.slice(2);

const client = net.createConnection({ port: 8124 }, () => {
  // 'connect' listener.
  console.log('connected to server!');  

  // spawns pico8
  // args 0: exe location
  // args 1: parameters
  const pico8 = spawn(args[0], ['-home',args[1],'-p','client']);

  pico8.stderr.on('data', (data) => {
    console.error(`[PICO8] error: ${data}`);
  });

  pico8.on('close', (code) => {
    console.log(`PICO8 process exited with code ${code}`);
    server.close();
  });

  client.on('end', () => {
    console.log('client disconnected');
  });

  // connect pico to remote client
  pico8.stdout.pipe(client);
  // connect pico to incoming data
  client.pipe(pico8.stdin);
});

client.on('end', () => {
  console.log('disconnected from server');
});