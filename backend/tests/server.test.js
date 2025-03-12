const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

console.log('chaiHttp:', chaiHttp); // Debug
chai.use(chaiHttp);
console.log('chai.request:', chai.request); // Debug
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

  it('should return 200 for unknown routes (static fallback)', (done) => {
    chai.request(app)
      .get('/random-route')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        done();
      });
  });
});