process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../../server');
var users = require('../../app/controllers/users');
var config = require('../../config/config');
chai.use(chaiHttp);
chai.should();
chai.expect();


// For the purpose of testing this use must exists in the database
var existingUser = {"email":"mathberd@gmail.com", "password":"enter", "name":"Mico", "id":"5c92383c9c29b025b087f959"};
var tokenOfExistingUser = users.generateJWT(existingUser.id, existingUser.name, config.secretKey);

describe("Testing auth APIs /api/auth/login and /api/auth", function(){
    
    it("should return a jwt token if the correct email and password are sent to /api/auth/login", function(done){
        chai.request(app)
            .post('/api/auth/login')
            .type('form')
            .send({
                '_method':'post',
                'email':existingUser.email,
                'password':existingUser.password
            })
            .end(function(err, res){
                res.should.have.status(200);
                res.body.token.should.be.a('string');
                done();
            });
    });

    it("should return a 401 status code and a string message if an incorrect email or password are sent to /api/auth/login", function(done){
        chai.request(app)
            .post('/api/auth/login')
            .type('form')
            .send({
                '_method':'post',
                'email':existingUser.email,
                'password':"randomText"
            })
            .end(function(err, res){
                res.should.have.status(401);
                res.body.msg.should.be.a('string');
                done();
            });
    });

    it("should return a 401 status code if a invalid jwt is sent to /api/auth", function(done){
        chai.request(app)
            .get('/api/auth')
            .set('Authorization', 'randomTokenStringXXXXXXXX')
            .end(function(err, res){
                res.should.have.status(401);
                done();
            });
    });

    it("should return a 200 status code and Authorized as message if a correct jwt sent to /api/auth/", function(done){
        chai.request(app)
            .get('/api/auth')
            .set('Authorization', tokenOfExistingUser)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.message.should.equal('Authorized');
                done();
            });
    });
});