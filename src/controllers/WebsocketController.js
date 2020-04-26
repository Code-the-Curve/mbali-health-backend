import consultationContoller from './ConsultationController.js'

var rooms = {} // consultation id -> [client]
class WebsocketController {
  static handleJoin(client, data){
    const { uid } = data

    consultationContoller.getAllConsultations(uid)
    .then(consultations => {
      consultations.forEach(consultation => {
        const roomId = consultation._id;
        if (roomId in rooms) {
          const currentRoom = rooms[roomId]
          if (!currentRoom.includes(client)) {
            currentRoom.push(client)
            console.log(`${uid} joined room ${roomId} with client ${client.id}`)
          }
        } else {
          rooms[roomId] = [client]
          console.log(`${uid} joined room ${roomId} with client ${client.id}`)
        }
      })
    })
  }

  static handleMessageReceived(client, data) {
    const { room, message, from, sent_ts } = data;
    console.log(`${from} sent "${message}" to ${room} from client ${client.id}`);
    
    consultationContoller.saveMessage({from, message, sent_ts}, room)
    this.sendMessageToRoom(room, {consultation: room, msg: {message, from, sent_ts}});
  }

  static sendMessageToRoom(room, data) {
    if (room in rooms) {
      console.log(`Sending "${data.msg.message}" from "${data.msg.from}" to room "${room}"`)
      rooms[room].forEach(c => { c.emit('message', data) });
    }
  }
}

export default WebsocketController