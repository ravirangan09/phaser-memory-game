import { Game, AUTO } from 'phaser'
import LoginScene from './scenes/LoginScene'
import MemoryGame from './scenes/MemoryGame'

const config = {
	type: AUTO,
	width: '100%',
	height: '100%',
	parent: 'game',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [LoginScene, MemoryGame]
}

export default new Game(config)