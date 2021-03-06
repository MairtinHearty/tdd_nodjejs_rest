var UserController = require('../../app/controllers/userController');
var should = require('should');
var sinon = require('sinon');
const _ = require('lodash')
require('should-sinon');

describe('UsersController', () => {
    var client = {};
    var users = new UserController(client, 'index', 'type');

    describe('index', () => {
        before(() =>
            client.search = () =>
                new Promise((resolve, reject) =>
                    resolve({
                        "took": 27,
                        "timed_out": false,
                        "_shards": {
                            "total": 5,
                            "successful": 5,
                            "failed": 0
                        },
                        "hits": {
                            "total": 1,
                            "max_score": 1,
                            "hits": [
                                {
                                    "_index": 'index',
                                    "_type": 'type',
                                    "_id": "AVhMJLOujQMgnw8euuFI",
                                    "_score": 1,
                                    "_source": {
                                        "username": "Mairtin",
                                        "userpassword":"1234"
                                    }
                                }
                            ]
                        }
                    })
                )
        );

        it('parses and returns post data', () =>
            users.index().then((result) =>
                result.should.deepEqual([{
                    id: "AVhMJLOujQMgnw8euuFI",
                    username: "Mairtin",
                    userpassword: "1234"
                }])
            )
        );

        it('specifies proper index and type while searching', () => {
            const spy = sinon.spy(client, 'search');

            //It's expected below that method search() is called once with
            //proper index name and object type as paramters.
            return users.index().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    index: 'index',
                    type: 'type'
                });
            });
        });
    });

    describe('create', () => {

        const attrs = {username: 'Mairtin', userpassword: '1234'}

        before(() => {
            client.index = () =>
                new Promise((resolve, reject) =>
                    resolve({
                        "_index": 'index',
                        "_type": "type",
                        "_id": "AViXYdnZxmF-_Ui11JAF",
                        "_version": 1,
                        "created": true
                    })
                );
        });

        it('parses and returns post data', () =>
            users.create(attrs).then((result) =>
                result.should.deepEqual(_.merge({ id: "AViXYdnZxmF-_Ui11JAF" }, attrs))
            )
        );


        it('specifies proper index, type and body', () => {
            const spy = sinon.spy(client, 'index');

            return users.create(attrs).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    index: 'index',
                    type: 'type',
                    body: attrs
                })
            })
        })
    })

    describe('show', () => {

        const id = "AVhMJLOujQMgnw8euuFI";
        const attrs = {username: 'Mairtin', userpassword: '1234'}

        before(() =>
        client.get= () =>
            new Promise((resolve, reject) =>
            resolve({
                "_index": 'index',
                "_type": 'post',
                "_id": id,
                "_version": 1,
                "found": true,
                "_source": attrs
            })
            )
        )

        it('parses id and returns user data', () =>
            users.show(id).then((result)=>
                result.should.deepEqual(_.merge({id: id}, attrs))
            )
        )

        it('specifies proper index and type and id', () => {
            const spy = sinon.spy(client, 'get');

                return users.show(1).then(()=> {
                    spy.should.be.calledOnce();
                    spy.should.be.calledWith({
                        index: 'index',
                        type: 'type',
                        id: 1
                    })
                })
        })

        context('when there is no user with the specified id', () => {
            before(() =>
                client.get = () => {
                    return new Promise((resolve, reject) =>
                        resolve({
                            "_index": 'index',
                            "_type": 'post',
                            "_id": id,
                            "found": false
                        })
                    );
                }
            );

            it('returns rejected promise with the non existing post id', () =>
                users.show(id).catch((result) =>
                    result.should.equal(id)
                )
            );
        });

    })

    describe('update', () => {
        const id = "AVhMJLOujQMgnw8euuFI";
        const attrs = {username: 'Mairtin', userpassword: '1234'}

        before(()=>
            client.update = () =>
            new Promise ((resolve, reject) =>
                resolve({
                    "_index": "index",
                    "_type": "type",
                    "_id": id,
                    "_version": 4
                })
            )
        )

        it('parses and returns updated data', () =>
            users.update(id, attrs).then((result) =>
                result.should.deepEqual(_.merge({id: id}, attrs))
            )
        )

        it('specifies proper index, type, id and attrs', () => {
            const spy = sinon.spy(client, 'update');

            return users.update(id, attrs).then(()=> {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    index: 'index',
                    type: 'type',
                    id: id,
                    doc: attrs
                })
            })


            }
        )

        context('when there is no post with the specified id', () => {
            before(() =>
                client.update = () => {
                    return new Promise((resolve, reject) =>
                        resolve({
                            "error": "DocumentMissingException[[node_api][3] [posts][AVhMJLOujQMgnw8euuFI]: document missing]",
                            "status": 404
                        })
                    );
                }
            );

            it('returns rejected promise with the non existing post id', () =>
                users.update(id, attrs).catch((result) =>
                    result.should.equal(id)
                )
            );
        });
    })


    describe('destroy', () => {
        const id = "AVhMJLOujQMgnw8euuFI";

        before(() =>
            client.delete = () =>
                new Promise((resolve, reject) =>
                    resolve({
                        "found": true,
                        "_index": "index",
                        "_type": "type",
                        "_id": id,
                        "_version": 6
                    })
                )
        );

        it('parses and returns post data', () =>
            users.destroy(id).then((result) =>
                result.should.equal(id)
            )
        );

        it('specifies proper index, type and id', () => {
            const spy = sinon.spy(client, 'delete');

            return users.destroy(id).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    index: 'index',
                    type: 'type',
                    id: id
                });
            });
        });

        context('when there is no post with the specified id', () => {
            //ES returns "found" equals false if is not able to find resource
            //with the specified identifier.
            before(() =>
                client.delete = () =>
                    new Promise((resolve, reject) =>
                        resolve({
                            "found": false,
                            "_index": "index",
                            "_type": "type",
                            "_id": id,
                            "_version": 6
                        })
                    )
            );

            //checks that promise is rejected
            it('returns rejected promise with the non existing post id', () =>
                users.destroy(id).catch((result) =>
                    result.should.equal(id)
                )
            );
        });
    });


})