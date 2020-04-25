var rooms = {}
class WebsocketController {
  static handleJoin(client, room, cb){
    if (room in rooms) {
      const currentRoom = rooms[room]
      if (!currentRoom.includes(client)) {
        currentRoom.push(client)
        console.log(`${client.id} joined room ${room}`)
      }
    } else {
      rooms[room] = [client]
      console.log(`${client.id} joined room ${room}`)
    }
    cb({room, user: client.id})
  }

  static handleMessageReceived(client, data) {
    const { room, message } = data;
    
    console.log(`${client.id} sent "${message}" to ${room}`);

    this.sendMessageToRoom(room, {message, from: client.id});
  }

  static sendMessageToRoom(room, data) {
    if (room in rooms) {
      console.log(`Sending "${data.message}" from "${data.from}" to room "${room}"`)
      rooms[room].forEach(c => { c.emit('message', data) });
    }
  }
}

export default WebsocketController