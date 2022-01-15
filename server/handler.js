const players = new Map();

const success = (data=null)=>({ status: 'ok', data });
const error = (reason="Error")=>({ status: "error", reason });

module.exports = (io, socket)=>{
    console.log('A user connected', socket.id);
    socket.on("login", (name, callback)=>{
      for(const [,d] of players) {
        if(d.name == name)
          return callback(error(`${name} already connected. Choose a different user...`))
      }
      players.set(socket.id, { name, id: socket.id, score: 0 });
      callback(success(true));
      if(players.size == 2) {
        setTimeout(()=>io.emit("startgame", Array.from(players.values())), 500);
      }
    })
    socket.on("broadcast", (actionName, actionData)=>io.emit(actionName, actionData))
    socket.on("disconnect", (reason)=>{
      console.log("disconnected ", reason, socket.id)
      players.delete(socket.id);
    })
}
