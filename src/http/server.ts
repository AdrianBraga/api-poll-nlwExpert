import fastify from 'fastify';
import { CreatePoll } from './routes/create-poll';
import { GetPoll } from './routes/get-poll';
import { VoteOnPoll } from './routes/vote-on-poll';
import fastifyCookie from '@fastify/cookie';

const app = fastify();

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
  hook: 'onRequest',
})

app.register(CreatePoll);
app.register(GetPoll);
app.register(VoteOnPoll);

app.listen({
  port: 3333
}).then(() => {
  console.log(`HTTP server running!`)
})