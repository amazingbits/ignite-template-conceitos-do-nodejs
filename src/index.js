const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const hasUserAccount = users.find((user) => user.username === username);
  if (!hasUserAccount) {
    return response.status(400).json({ error: "User not found!" });
  }
  request.user = hasUserAccount;
  return next();
}

function checkIfUsernameAlreadyExists(request, response, next) {
  const { username } = request.body;
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return response.status(400).json({ error: "Username already exists!" });
  }
  return next();
}

function checkExistsTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }
  request.todo = todo;
  return next();
}

app.post('/users', checkIfUsernameAlreadyExists, (request, response) => {
  const { name, username } = request.body;
  const userParams = { id: uuidv4(), name, username, todos: [] };
  users.push(userParams);
  return response.status(201).json(userParams);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todoParams = {
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
    id: uuidv4()
  };
  user.todos.push(todoParams);
  return response.status(201).json(todoParams);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { user, todo } = request;
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { todo } = request;
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const { user, todo } = request;
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;