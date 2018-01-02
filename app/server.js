const restify = require('restify');

//PostsController intance must be created and passed from outside
module.exports = (users) => {
    const server = restify.createServer();

    server.use(restify.plugins.bodyParser());

    server.get('/users', (req, res, next) =>
        users.index().then((result) =>
            //we are not testing content here just server availability
            res.send(200, result)
        )
    );

    server.post('/users', (req,res,next) =>
        users.create(req.params.post).then((result)=>
        res.send(201, result)
        )
    )

    server.get('/users/:id', (req, res, next) =>
        users.show(req.params.id).then((result) =>
            res.send(200, result)
        ).catch(() => res.send(404))
    )
    server.del('/users/:id', (req, res, next) =>
        users.destroy(req.params.id).then((result)=>
            res.send(200, {id: req.params.id})
        ).catch(()=> res.send(404))
    )
    return server;
};