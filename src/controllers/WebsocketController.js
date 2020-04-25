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

    console.log(`${client.id} sent /${message}/ to ${room}`);
  
    const res =  {...data, from: client.id}
    rooms[room].forEach(c => { c.emit('message', res) })
  }
}

export default WebsocketController