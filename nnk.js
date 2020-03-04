const amqp = require('amqp');

const rabbit = amqp.createConnection();
rabbit.on('ready', () => {
  rabbit.queue(
    'first-queue-name',
    { autoDelete: false },
    (q) => {
      q.bind('my-first-exchange', 'first-queue');
      q.subscribe(
        (message, headers, deliveryInfo, messageObject) => {
          console.log(message);
          // console.log(headers);
          // console.log(deliveryInfo);
          // console.log(messageObject);
        },
      );
    },
  );
});
