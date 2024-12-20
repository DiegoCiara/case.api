import Access from '@entities/Access';
import Assistant from '@entities/Assistant';
import Contact from '@entities/Contact';
import Playground from '@entities/Playground';
import PlaygroundMessage from '@entities/PlaygroundMessage';
import Workspace from '@entities/Workspace';
import { ioSocket, socket } from '@src/socket';
import eventEmitter from '@utils/emitter';
import { decrypt } from '@utils/encrypt';
import { checkPlayground } from '@utils/openai/checks/checkPlayground';
import { openaiPlayground } from '@utils/openai/functions/openaiPlayground';
import { openaiText } from '@utils/openai/functions/openaiText';
import { openaiThread } from '@utils/openai/functions/openaiThread';
import { sendMessage } from '@utils/whatsapp/whatsapp';
import amqp from 'amqplib';
import OpenAI from 'openai';

export async function proccessPlayground() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('playgrounds', { durable: true });

    channel.consume('playgrounds', async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log('payload object parsed', payload)
        const { workspaceId, assistantId, playgroundId, accessId, message } = payload;

        const playgroundFind = await Playground.findOne(playgroundId, { relations: ['workspace', 'messages']});
        const workspace = await Workspace.findOne(workspaceId);
        const access = await Access.findOne(accessId, {relations: ['user']});

        const {playground} = await checkPlayground(playgroundFind, workspace)

        const response = await PlaygroundMessage.create({
          workspace: workspace,
          playground: playground,
          type: 'text',
          content: message[0].text,
          user: access.user,
          from: 'USER',
        }).save();

        (await ioSocket).emit(`playground:${playground.id}`, 'USER')

        if(response){
          const play = await openaiPlayground(workspace, playground, assistantId, message);
          (await ioSocket).emit(`playground:${playground.id}`, play?.text)
        }
        // Confirma o processamento da mensagem
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error)
  }
}

