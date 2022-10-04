// ESM
import 'dotenv/config'
import path from 'path'
import Fastify from 'fastify'
import fetch from "node-fetch"
import {google} from 'googleapis'
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

// Route declarations
fastify.get('/', function (request, reply) {
    reply.header('Content-Type', 'text/html')
    reply.view("./views/homepage.hbs")
})

fastify.get('/search', function (request, reply) {   
    var searchTerm = String(request.query.search_term);

    fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${searchTerm}&key=${process.env.API_KEY}`, {
        method: 'GET',
        headers: {
            'Accept':'application/json'
        }
    })
    .then((response) => response.json())
    .then((json) => console.log(json.items))

    reply.header('Content-Type', 'text/html')
    reply.view("./views/homepage.hbs")
})

// Run the server
fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})