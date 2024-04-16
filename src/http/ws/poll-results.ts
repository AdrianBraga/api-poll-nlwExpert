import { FastifyInstance } from "fastify";

export async function pollResults(app: FastifyInstance) {
  app.get('/polls/:pollId/results', { websocket: true }, (socket, request) => {
    socket.on('message', (message: string) => {
      socket.send('You sent: ' + message);

      setInterval(() => {
        socket.send('Stream')
      }, 500)
    });
  });
};