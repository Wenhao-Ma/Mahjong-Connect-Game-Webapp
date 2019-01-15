const { expect } = require('chai');

const server = require('../server');
const request = require('supertest')(server);
let token;

before((done) => {
  request.post('/users/login') // login
    .set('Accept', 'application/json')
    .send({
      email: 'test4@qq.com',
      password: '123456'
    })
    .expect(200)
    .end((err, res) => {
      token = res.body.token; // get JWT
      done();
    });
});

describe('lobby api', function () {
  this.timeout(10 * 1000);

  after(function (done) {
    server.close();
    done();
  });

  it('should return 401 if not authorized: /lobby/profile', (done) => {
    request.get('/lobby/profile')
      .expect(401)
      .end(() => done())
  });

  it('get current user profile', (done) => {
    request.get('/lobby/profile')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body.username).to.equal("hehelll");
        expect(res.body.email).to.equal("test4@qq.com");
        done();
      })
  });

  it('should return 401 if not authorized: /lobby', (done) => {
    request.get('/lobby')
      .expect(401)
      .end(() => done())
  });

  it('get all room', (done) => {
    request.get('/lobby')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      })
  });

  it('should return 401 if not authorized: /lobby/create-room', (done) => {
    request.get('/lobby/create-room')
      .expect(401)
      .end(() => done())
  });

  it('should return 400 if create room with empty name', (done) => {
    request.post('/lobby/create-room')
      .set('Authorization', token)
      .send({
        name: '',
        mode: 0,
        size: 3
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).to.equal("name is empty");
        done();
      })
  });

  it('should return 400 if create room with invalid size', (done) => {
    request.post('/lobby/create-room')
      .set('Authorization', token)
      .send({
        name: 'haha',
        mode: 0,
        size: 5
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).to.equal("size is invalid");
        done();
      })
  });

  it('should return 400 if create room with invalid mode', (done) => {
    request.post('/lobby/create-room')
      .set('Authorization', token)
      .send({
        name: 'haha',
        mode: 2,
        size: 4
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).to.equal("mode is invalid");
        done();
      })
  });

  it('create room successfully and end up with status 0', (done) => {
    request.post('/lobby/create-room')
      .set('Authorization', token)
      .send({
        name: 'haha',
        mode: 0,
        size: 2
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        const room = res.body;
        expect(room.players).to.have.lengthOf(1);
        expect(room.status).to.equal(0);
        done();
      })
  });

  it('create room successfully and end up with status 1', (done) => {
    request.post('/lobby/create-room')
      .set('Authorization', token)
      .send({
        name: 'haha',
        mode: 0,
        size: 1
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        const room = res.body;
        expect(room.players).to.have.lengthOf(1);
        expect(room.status).to.equal(1);
        done();
      })
  });

  it('should return 401 if not authorized: /lobby/scoreboard', (done) => {
    request.get('/lobby/scoreboard')
      .expect(401)
      .end(() => done())
  });

  it('get scoreboard', (done) => {
    request.get('/lobby/scoreboard')
      .set('Authorization', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      })
  });

  it('should return 401 if not authorized: /lobby/:room_id', (done) => {
    request.get('/lobby/:room_id')
      .expect(401)
      .end(() => done())
  });

  it ('should return 404: get one unexist room', (done) => {
    request.get('/lobby/roomNotExist')
      .set('Authorization', token)
      .expect(400)
      .end((err, res) => {
        done();
      })
  });

});