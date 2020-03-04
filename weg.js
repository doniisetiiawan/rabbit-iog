const http = require('http');
const amqp = require('amqp');

const startServer = (ex) => {
  const server = http.createServer(({ url }, res) => {
    console.log(url);
    ex.publish('first-queue', { message: url });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Simple HTTP Server in Node.js!</h1>');
  });

  server.listen(8001);
};

const rabbit = amqp.createConnection();

rabbit.on('ready', () => {
  rabbit.exchange(
    'my-first-exchange',
    { type: 'direct', autoDelete: false },
    (ex) => {
      startServer(ex);
    },
  );
});
