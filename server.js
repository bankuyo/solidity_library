const { createServer } = require('http');
const next = require('next');

const app = next({
    dev: process.env.NODE_ENV !== 'production'
});

const handle = app.getRequestHandler();


app.prepare().then(() => {
    createServer(handle).listen(3000, (err) => {
        if (err) throw err;
        console.log('Ready on localhost:3000');
    });
});