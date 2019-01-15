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

describe('users api', function () {
  this.timeout(10 * 1000);

  after(function (done) {
    server.close();
    done();
  });

  it('should return 401 if not authorized: /users/current', (done) => {
    request.get('/users/current')
      .expect(401)
      .end(() => done())
  });

  it('get current user', (done) => {
    request.get('/users/current')
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

  it('should return 401 if not authorized: /users/edit_profile', (done) => {
    request.get('/users/edit_profile')
      .expect(401)
      .end(() => done())
  });

  it('should return 400 if username is empty when editing', (done) => {
    request.post('/users/edit_profile')
      .set('Authorization', token)
      .send({
        firstname: "aa",
        lastname: "bb"
      })
      .expect(400)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).to.equal("username is empty");
        done();
      })
  });

  it('edit profile', (done) => {
    request.post('/users/edit_profile')
      .set('Authorization', token)
      .send({
        username: "hehelll",
        firstname: "aa",
        lastname: "bb"
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body.username).to.equal("hehelll");
        expect(res.body.firstname).to.equal("aa");
        expect(res.body.lastname).to.equal("bb");
        done();
      })
  });

});