require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// POST for adding todos
app.post('/todos', (req, res) => {
  var addTodo = new Todo({
    text: req.body.text
  });

  addTodo.save().then((doc) => {
    res.send(doc);
  }).catch((err) => res.status(400).send(err));
});

// GET all todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }).catch((err) => res.status(400).send(err));
});

// GET todos by id
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    else {
      res.send({todo});
    }
  }).catch((err) => res.status(400).send());
});

// DELETE by id
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    else {
      res.send({todo});
    }
  }).catch((err) => res.status(400).send());
});

// PATCH by id to update todos
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      res.status(404).send();
    }
    else {
      res.send({todo});
    }
  }).catch((err) => res.status(400).send());
});

// POST /users to create new user accounts
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var newUser = new User(body);

  newUser.save().then(() => {
    return newUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(newUser);
  }).catch((err) => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => res.status(400).send());
});



app.listen(port, () => {
  console.log(`Started on port ${port}`);
})

module.exports = {
  app
}
