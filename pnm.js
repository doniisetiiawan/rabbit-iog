const express = require('express');
const amqp = require('amqp');

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
  app.listen(8002);
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
