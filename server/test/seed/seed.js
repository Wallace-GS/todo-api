const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'wallace@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abd123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'john@example.com',
  password: 'userTwoPass'
}];

const todos = [{
  _id: new ObjectID(),
  text: 'first todo'
}, {
  _id: new ObjectID(),
  text: 'second todo',
  completed: true,
  completedAt: 123
}];

const populateTodos = (done) => {
  Todo.deleteMany({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
