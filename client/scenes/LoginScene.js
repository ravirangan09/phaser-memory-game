import { Scene } from 'phaser';
import Button from '../objects/Button';
const GUTTER = 20;
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 40;
const LEFT = 100;
const TOP = 40;

import { io } from 'socket.io-client';
import userList from '../userlist.json';

export default class LoginScene extends Scene
{
  constructor() {
    super('login-scene')
  }

  init() {
    console.log("login init ", this.data)
    this.initSocket();
  }

  render() {
    let x =  LEFT;
    let y = TOP + 2*GUTTER;

    this.statusText = this.add.text(LEFT, TOP, "Click user name to connect...", { color: 'cyan'});
    this.userButtons = [];
    for(const name of userList) {
      const button = new Button(this, x, y, BUTTON_WIDTH, BUTTON_HEIGHT, name, 
                                        { action: 'login', 
                                          username : name 
                                        }
                                )
      this.userButtons.push(button);
      y += BUTTON_HEIGHT + GUTTER;
    }
  }

  initSocket() {
    const socket = io();
    socket.on("connect", ()=>{ this.socket=socket; });
  }

  async doLogin(username) {
    this.socket.emit("login", username, res=>{
      if(res.status == "ok") {
        this.statusText.text = `${username} logged in successfully. Waiting for other users to join...`
        this.playerName = username;
        this.userButtons.forEach(b=>b.hide())
      }
      else {
        //failure; show reason
        this.statusText.text = res.reason;
      }
    })
    this.socket.on("startgame", (players)=>{
      this.scene.start("memory-game", { socket: this.socket, 
                                        players, 
                                        playerName: this.playerName,
                                      })
    })
  }

  async doAction(actionData) {
    switch(actionData.action) {
    case "login":
      return this.doLogin(actionData.username);
    }
  }

  async doClick(gameObject) {
    const actionData = gameObject.getData('action');
    if(actionData) return await this.doAction(actionData);
    return false;
  }

  initEvents() {
    this.input.on('gameobjectup', (pointer, gameObject) => {
      this.doClick(gameObject);
    });

    this.input.on('gameobjectdown', (pointer, gameObject) => {
    });

    //shutdown needed as scene.restart refreshes object and 
    //multiple handlers are active which need to be closed
    this.events.on("shutdown", ()=>{
      this.events.off("shutdown");
      this.input.off("gameobjectup");
      this.input.off("gameobjectdown");
    });
  }

  create() {
    this.render();
    this.initEvents();
  }
}
