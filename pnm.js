import express from 'express';
import amqp from 'amqp';
import io from 'socket.io';

const app = express();
app.use(express.static(__dirname));
const rabbit = amqp.createConnection();

const startServer = (ex) => {
  app.get('/credit_charge', (req, res) => {
    rabbit.queue(
      '',
      { exclusive: true, autoDelete: true },
      (q) => {
        q.bind('credit_charge', q.name);
        ex.publish(
          'charge',
          { card: 'details' },
          { replyTo: q.name },
        );
        q.subscribe((message) => {
          console.log(message);
          q.destroy();
          q.close();
          res.send('Charged! Thanks!');
        });
      },
    );
  });
  const server = app.listen(8002);

  io = io.listen(server);

  io.on('connection', (socket) => {
    rabbit.queue(
      socket.id,
      { exclusive: true, autoDelete: true },
      (q) => {
        q.bind('credit_charge', q.name);

        q.subscribe((message, { emitEvent }, delivery) => {
          console.log(delivery);
          socket.emit(emitEvent);
        });

        socket.on('charge', (data) => {
          console.log(data);
          ex.publish(
            'charge',
            { card: 'details' },
            {
              replyTo: q.name,
              headers: { emitEvent: 'charged' },
            },
          );
        });

        socket.on('disconnect', () => {
          q.destroy();
          q.close();
        });
      },
    );
  });
};

rabbit.on('ready', () => {
  rabbit.exchange(
    'credit_charge',
    { autoDelete: false },
    (ex) => {
      rabbit.queue('charge', { autoDelete: false }, (q) => {
        q.bind('credit_charge', q.name);
        q.close();
        startServer(ex);
      });
    },
  );
});
