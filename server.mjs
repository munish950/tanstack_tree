import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom middleware to strictly filter by parentId
server.use((req, res, next) => {
  
  if (req.method === 'GET' && req.path === '/persons' && req.query.parentId) {
    const parentId = req.query.parentId;

    // Remove default query param filtering
    delete req.query.parentId;

    // Manually filter from db
    const data = router.db.get('persons')
      .filter(p => p.parentId === parentId)
      .value();

    res.jsonp(data);
  } else {
    next();
  }
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
