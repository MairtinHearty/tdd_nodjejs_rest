const supertest = require('supertest');
const server = require('../app/server');
const _ = require('lodash');

describe('server', () => {
    //UserController stub
    const users = {};
    const request = supertest(server(users));
    const data = [{id: 1, username: 'Mairtin', userpassword:'1234'}]

    describe('GET /users', () => {
        const data = [{id: 1, username: 'Mairtin', userpassword:'1234'}]

        //test function that is called by the server instance
        before(() => {
            users.index = () =>
                new Promise((resolve, reject) =>
                    resolve(data)
                );
        });

        it('responds with OK', () =>
            request
                .get('/users')
                .expect(data)
                .expect(200)
        );
    });

    describe('POST /users', () => {
        //data that is sent to the server
        const data = [{username: 'Mairtin', userpassword:'1234'}];

        before(() => {
            //so we expect server to return attributes fo the new post
            users.create = (attrs) =>
                new Promise((resolve, reject) =>
                    resolve(_.merge({ id: 2 }, data))
                );
        });

        it('responds with Created and returns content of the newly create post', () =>
            request
                .post('/users')
                .send({ post: data })
                .expect(_.merge({ id: 2 }, data))
                .expect(201)
        );
    });

    describe('/GET /users/:id ', () => {

        const data = [{username: 'Mairtin', userpassword:'1234'}]

        before(()=> {
            users.show = (id) =>
                new Promise ((resolve, reject) =>
                resolve(_.merge({id: id}, data))
                );
        })

        it('responds with OK and returns content of the post', () =>
            request
                .get('/users/3')
                .send(data)
                .expect(_.merge({id:3}, data))
                .expect(200)
        )

        context('when there is no post with the specified id', () => {
            //here its assumed that controller will return rejected promice
            //when post with the specified id is not found
            before(() => {
                users.show = (id) =>
                    new Promise((resolve, reject) =>
                        reject(id)
                    );
            });

            //test that server responds with 404 code if post was not found
            it('responds with NotFound', () =>
                request
                    .get('/users/3')
                    .send(data)
                    .expect(404)
            );
        });

    })

    describe('Delete specific user /users/:id', () => {
        //stub the destroy method
        before(() =>
            users.destroy = (id) =>
                new Promise ((resolve, reject) =>
                    resolve({id: id})
                )
        );

        it('responds with the id of the deleted user', () =>
        request
            .delete('/users/5')
            .expect({id: 5})
        )

        context('when there is no user with the specific id', () => {
            before(() =>
            users.destroy = (id) =>
                new Promise((resolve, reject) =>
                    reject(id)
                )
            )

            it('responds with NotFound', () =>
                request
                    .delete('/posts/5')
                    .expect(404)
            )
        })
    })
});