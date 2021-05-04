const express = require('express')()
const server = require('http').Server(express)
const PORT = process.env.PORT || 5000
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
})

let room = {
  roomId: '',
  host: '',
  partner: '',
  hostName: '',
  partnerName: '',
}

server.listen(PORT, () => {
  console.log(`Listen at port ${PORT}...`)
})

io.on('connection', (socket) => {
  //Player join
  socket.on('host-join', () => {
    socket.join(`room-${socket.id}`)
    room.host = socket.id
    room.roomId = socket.id
    socket.emit('host-id', room.roomId)
    console.log('HOST JOIN: ', room)
  })
  socket.on('partner-join', (roomId) => {
    socket.join(`room-${roomId}`)
    room.partner = socket.id
    socket.emit('partner-join', room.hostName)
    io.to(`room-${room.roomId}`).emit('partner-joined')
    console.log('partner naming... ', room.roomId)
  })
  socket.on('setHostName', (hostName) => {
    room.hostName = hostName
  })
  socket.on('setPartName', (partnerName) => {
    room.partnerName = partnerName
    console.log("partnerNameCreated: ",partnerName)
    io.to(`room-${room.roomId}`).emit('partnerNameCreated', partnerName)
  })
  socket.on('startNewGame', (newGameState) => {
    io.to(`room-${room.roomId}`).emit('startedNewGame', newGameState)
  })
  socket.on('resetName', () => {
    let playersName = [room.hostName, room.partnerName]
    io.to(`room-${room.roomId}`).emit('resetName', playersName)
  })
  //roll dice
  socket.on('roll-dice', (playingState) => {
    io.to(`room-${room.roomId}`).emit('roll-dice', playingState)
  })
})
