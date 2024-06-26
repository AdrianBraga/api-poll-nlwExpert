import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { randomUUID } from 'node:crypto'

import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { voting } from "../../utils/voting-pub-sub";

export async function VoteOnPoll(app: FastifyInstance) {
  app.post('/polls/:id/votes', async (request, reply) => {
    const voteOnPollParams = z.object({
      id: z.string(),
    });
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    });
  
    const { id } = voteOnPollParams.parse(request.params);
    const { pollOptionId } = voteOnPollBody.parse(request.body);

    // Cookies
    let { sessionId } = request.cookies;

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId: id
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        // Apagar o voto anterior
        // Criar um novo voto
        
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id
          }
        });

        const votes = await redis.zincrby(id, -1, userPreviousVoteOnPoll.pollOptionId);

        voting.publish(id, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes)
        });

      } else if (userPreviousVoteOnPoll) {
        return reply.status(400).send({
          message: 'You already voted on this poll.'
        })
      }
    };

    if (!sessionId) {
      sessionId = randomUUID();
  
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 Dias
        signed: true,
        httpOnly: true
      });
    };

    await prisma.vote.create({
      data: {
        sessionId,
        pollId: id,
        pollOptionId
      },
    });

    const votes = await redis.zincrby(id, 1, pollOptionId);

    voting.publish(id, {
      pollOptionId,
      votes: Number(votes)
    });

    return reply.status(201).send();
  })
}