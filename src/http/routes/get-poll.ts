import { FastifyInstance } from "fastify";
import { z } from 'zod';
import { prisma } from "../../lib/prisma";

export async function GetPoll(app: FastifyInstance) {
  app.get('/polls/:id', async (request, reply) => {
    const getPollParams = z.object({
      id: z.string(),
    });
  
    const { id } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })
  
    return reply.send({ poll });
  })
}