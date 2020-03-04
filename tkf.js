const amqp = require('amqp');

const rabbit = amqp.createConnection();

rabbit.on('ready', () => {
  rabbit.exchange(
    'credit_charge',
    { autoDelete: false },
    (ex) => {
      rabbit.queue('charge', { autoDelete: false }, (q) => {
        q.bind('credit_charge', 'charge');
        q.subscribe(
          (
            message,
            headers,
            deliveryInfo,
            messageObject,
          ) => {
            setTimeout(() => {
              console.log(message);
              console.log(headers);
              console.log(deliveryInfo);
              console.log(messageObject);
              ex.publish(
                deliveryInfo.replyTo,
                { message: 'done' },
                { headers },
              );
            }, 1500);
          },
        );
      });
    },
  );
});
