// Importamos los módulos necesarios
const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');
const uuidv4 = require('uuid').v4;

// Creamos un servidor HTTP
const server = http.createServer()

// Creamos un servidor WebSocket que se ejecuta en el servidor HTTP
const wsServer = new WebSocketServer({ server });

// Definimos el puerto en el que se ejecutará el servidor
const port = 8000;

// Creamos dos objetos para almacenar las conexiones y los usuarios
const connections = {};
const users = {}; 

// Función para enviar a todos los usuarios conectados la lista de usuarios
const broadcastUsers = () => {
  Object.keys(connections).forEach(uuid => {
    const message = JSON.stringify(users);
    connections[uuid].send(message)
  })
}

// Función para manejar los mensajes recibidos de los usuarios
const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString())
  const user = users[uuid];
  user.state = message;
  broadcastUsers()
  console.log(`${users[uuid].username} update their state to ${JSON.stringify(user.state)}`);
}

// Función para manejar cuando un usuario se desconecta
const handleClose = (uuid) => { 
  console.log(`${users[uuid].username} has left`);
  delete connections[uuid];
  delete users[uuid];

  // user gone
  broadcastUsers()
}

// Evento que se dispara cuando un usuario se conecta
wsServer.on('connection', (connection, request) => {

  // ws://localhost:8000?username=Pedro
  
  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(username);
  console.log(uuid);
  connections[uuid] = connection;
  users[uuid] = {
    username,
    state: { }
  }
  connection.on('message', message => handleMessage(message, uuid))
  connection.on('close', () => handleClose(uuid))
})

// Iniciamos el servidor
server.listen(port, () => {
  console.log(`WSS is running on port ${port}`);
})