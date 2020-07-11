const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

var args = process.argv.slice(2);
var host = args[0];
var port = parseInt(args[1]);
args = args.slice(2);

const client = net.createConnection({ 
  host: host,
  port: port }, () => {
  // 'connect' listener.
  console.log(`Connected to ${host}:${port}`);  

  // spawns pico8
  // args 0: exe location
  // args 1: home
  // args 2: cart name
  const pico8 = spawn(args[0], ['-home',args[1],'-p','client','-run',path.join(args[1],'carts',args[2])]);

  pico8.stderr.on('data', (data) => {
    console.error(`[PICO8] error: ${data}`);
  });

  pico8.on('close', (code) => {
    console.log(`PICO8 process exited with code ${code}`);
    client.end();
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
  console.log('Disconnected from server');
});