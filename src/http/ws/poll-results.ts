import { FastifyInstance } from "fastify";
import { z } from 'zod';

import { voting } from "../../utils/voting-pub-sub";

export async function pollResults(app: FastifyInstance) {
  app.get('/polls/:pollId/results', { websocket: true }, (socket, request) => {
    const getPollParams = z.object({
      pollId: z.string(),
    });

    const { pollId } = getPollParams.parse(request.params);

    voting.subscribe(pollId, (message) => {
      socket.send(JSON.stringify(message))
    })
  });
};