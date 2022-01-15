# phaser-memory-game
Following up on the Solitaire game, this is a simple memory game. The only difference is, it is a multiplayer game (currently two) and uses socket.io for communication.

## Install
The standard `yarn install` for nodejs

## Run
`yarn server` for running the server
`yarn build` for building the phaser game into dist folder

Then each player launches htt://localhost:4000/public, chooses a player name and starts playing. Note: you need two players to start the game (or open the game in  two tabs)

Uses `parcel` builder



