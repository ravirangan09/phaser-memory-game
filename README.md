# phaser-memory-game
Following up on the [Solitaire](https://github.com/ravirangan09/phaser-solitaire) game, this is a simple memory game. The only difference is, it is a multiplayer game (currently two) and uses [socket.io](https://socket.io/) for communication.

## Install
The standard `yarn install` for nodejs

## Run
* `yarn server` for running the server
* `yarn build` for building the phaser game into dist folder

Then each player launches http://localhost:4000/public, chooses a player name and starts playing. Note: you need two players to start the game (or open the game in  two tabs)

There is a `src/userlist.json` file which contains the name of two players. Change it to match your names.

Uses `parcel` builder
