# PICO8 network

Multiplayer (hum...) over TCP network using Pico8 serial function.
Code snippet to transfer button state between 2 remote Pico8 instances.
_Note: doesn't support btnp as of now._

## Pre-Requisites
- NodeJS (tested with 12.8.2)
- Pico8 version > 0.2.1b (e.g. with serial support)
- Unpack repository at a known location (say, c:\games\pico8-net)

## How To
- On each computer, start a NodeJS command prompt
- On 'server' machine:
```console  
node server.js <port> <path to pico8.exe> <path to pico8-net> jelpi.p8
```
Example:
```console
node server.js 8124 c:\programmes\pico\pico8.exe c:\games\pico8-net jelpi.p8
```
- On 'client' machine:
```console   
node client.js <host> <port> <path to pico8.exe> <path to pico8-net> jelpi.p8
```
Example:
```console
node client.js 1.2.3.4 8124 c:\programmes\pico\pico8.exe c:\games\pico8-net jelpi.p8
```
- Enjoy totally broken Jelpi multiplayer!!

## Plug and Play (sort of...)
- Find a game with 2 player support
- Add following code (after cart code):
```lua
-->8
-- net code @freds72
-- note: must after cart normal code
local _i,_u,_btn=_init,_update,btn
local _mode="server"
function _init()
  _mode=stat(6)
  -- notify server we are ready
  serial(0x805,0x4300,1)
  -- flush serial
  flip()
  _i()
end

function btn(k,id)
  id=id or 0
  if _mode=="client" then
    if(id==1) return _btn(k)
  else
    if(id==0) return _btn(k)
  end
  return peek(0x4300+k)==1
end

function _update()
  -- collects button states
  for i=0,4 do
    poke(0x430f+i,_btn(i) and 1 or 0)
  end
  -- receives button states
  serial(0x804,0x4300,5)    

  -- run normal update
  _u()

  -- pushes "new" state (flush is called after update)
  serial(0x805,0x430f,5)
end
```
## Credits
@avi on Pico8 Discord on how to avoid deadlocks!

