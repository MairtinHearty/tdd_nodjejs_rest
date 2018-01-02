const client = require('./app/client')
const serverFactory = require('./app/server');
const UserController = require('./app/controllers/userController')

const users = new UserController(client, 'users_api', 'users');
const server = serverFactory(users);

server.listen(8080, () =>
    console.log('%s listening at %s', server.name, server.url)
);