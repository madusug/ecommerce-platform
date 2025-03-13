const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

chai.use(chaiHttp);
const { expect } = chai;

describe('Server Tests', () => {
  it('should return static HTML page', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        expect(res.text).to.include('Welcome to the Static Page');
        done();
      });
  });

  it('should return JSON from /api/message', (done) => {
    chai.request(app)
      .get('/api/message')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.property('message', 'Hello from the backend!');
        done();
      });
  });

  it('should return 200 for unknown routes', (done) => {
    chai.request(app)
      .get('/random-route')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        done();
      });
  });

  it('should return product list', (done) => {
    chai.request(app)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').with.lengthOf(3);
        done();
      });
  });

  it('should login with correct credentials', (done) => {
    chai.request(app)
      .post('/api/login')
      .send({ username: 'user', password: 'pass' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        done();
      });
  });

  it('should place an order', (done) => {
    chai.request(app)
      .post('/api/orders')
      .send({ userId: 1, productIds: [1, 2] })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        done();
      });
  });
});