import amqp from 'amqplib';

export async function sendToQueue(queue: string, message: any) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    setTimeout(() => {
      connection.close();
    }, 500);
}

