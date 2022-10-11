// ESM
import 'dotenv/config'
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

// Route declarations
fastify.get('/', function (request, reply) {
    reply.header('Content-Type', 'text/html')
    reply.view("./views/homepage.hbs")
})

fastify.get('/search', function (request, reply) {   
    var searchTerm = String(request.query.search_term);

    // calls Search API, finds video IDs for the other API calls
    fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${searchTerm}&type=video&key=${process.env.API_KEY}`, {
        method: 'GET',
        headers: {
            'Accept':'application/json'
        }
    })
    .then((response) => response.json())
    .then((json) => {
        // creates array of videoIds
        var jsonLength = Object.keys(json.items).length
        var videoIds = [];

        for (var i = 0; i < jsonLength; i++) {
            videoIds.push(json.items[i].id.videoId);
        }
        
        // creates string for concatenating to Video API call
        var string = videoIds.join("%2C");
        
        // calls Video API, responds with all video info
        fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics&id=${string}&key=${process.env.API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept':'application/json'
            }
        })
        .then((response) => response.json())
        .then((vidInfo) => console.log(vidInfo.items))

        // calls Comment Thread API, responds with top comment threads (can only do 1 video ID per request, must loop)
        for (var i = 0; i < jsonLength; i++) {
            fetch(`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=3&videoId=${videoIds[i]}&key=${process.env.API_KEY}`, {
                method: 'GET',
                headers: {
                    'Accept':'application/json'
                }
            })
            .then((response) => response.json())
            .then((json) => {
                try {
                    console.log(json.items)
                } catch (err){
                    console.error(err)
                }
            })
        }
        reply.header('Content-Type', 'text/html')
        reply.view("./views/searchresults.hbs", { items: json.items, searchTerm: searchTerm })    
    })
})

// Run the server
fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})