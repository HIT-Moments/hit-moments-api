const express = require('express');

const apiRoute = express.Router();

const routesApi = [
  {
    path: '/users',
    route: require('./user.route'),
  },
  {
    path: '/auth',
    route: require('./auth.route'),
  },
  {
    path: '/reports',
    route: require('./report.route'),
  },
  {
    path: '/feedbacks',
    route: require('./feedback.route'),
  },
  {
    path: '/moments',
    route: require('./moment.route'),
  },
  {
    path: '/friends',
    route: require('./friend.route'),
  },
  {
    path: '/reacts',
    route: require('./react.route'),
  },
];

routesApi.forEach((route) => {
  apiRoute.use(route.path, route.route);
});

module.exports = apiRoute;
