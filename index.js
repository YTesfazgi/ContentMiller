// ESM
import path from 'path'
import Fastify from 'fastify'
import fetch from "node-fetch"
import fastifyFormbody from '@fastify/formbody'
import fastifyStatic from '@fastify/static'
import fastifyPostgres from '@fastify/postgres'
import fastifyView from '@fastify/view'
import Handlebars from 'handlebars'

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyFormbody)
fastify.register(fastifyStatic, {
    root: path.join('/Users/yohanatesfazgi/Code/ContentMiller'),
    prefix: '/'
})
fastify.register(fastifyPostgres, {
    connectionString: 'postgres://postgres@localhost/test'
})
fastify.register(fastifyView, {
    engine: {
      handlebars: Handlebars,
    },
  });

// Declare a route
fastify.get('/', function (request, reply) {
    reply.header('Content-Type', 'text/html')
    reply.view("./views/homepage.hbs")
})

fastify.get('/search', function (request, reply) {   
    var searchTerm = String(request.query.search_term);

    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
    console.log(searchTerm)
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')

    reply.header('Content-Type', 'text/html')
    reply.view("./views/homepage.hbs")
})

// Runs the server
fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})