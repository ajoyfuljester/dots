const http = require('http');
const fs = require('fs');
const ws = require('ws');
const game = require('./game.js')

const hostname = '127.0.0.1';
const port = 8000;
const url = `http://${hostname}:${port}/`

function readDirectory(dir, abs = true, recursive = true) {
    let files = fs.readdirSync(dir, {recursive: true})
    
    files = files.filter(file => /.*\..*/g.test(file))
    
    // files = files.map(file => ''.replace('\\', '/'))
    
    files = files.reduce((acc, curr) => {
        acc['/' + dir + '/' + curr.replace('\\', '/')] = fs.readFileSync(dir + '\\' + curr)
        return acc
    }, {})
    
    return files
    
    
}

const staticFiles = readDirectory('static');
const MIME = {
    'js': 'application/javascript',
    'html': 'text/html',
    'css': 'text/css',
}

function requestHandler(req, res) {
    const path = req.url
    if (staticFiles[path] != undefined) {
        res.setHeader('Content-Type', MIME[path.substring(path.lastIndexOf('.') + 1)])
        res.writeHead(200)
        res.end(staticFiles[path])
    } else if (path == '/') {
        res.writeHeader(301, {Location: 'http://' + req.headers.host + '/static/index.html'})
        res.end()
    } else {
        res.end(path)
    }
    
}

const server = http.createServer(requestHandler);
server.listen(port, hostname, () => {
  console.log(`Server running at ${url}`);
});
const wsServer = new ws.WebSocketServer({server: server})

let myGame = null
const DELAY = 2500
let gameUpdates = null
let id = 0
let movesMap = []

wsServer.on('connection', wsClient => {
    wsClient.id = id
    id++
    wsClient.on('error', console.error)
    
    
    
    wsClient.on('message', data => {
        let dataJSON = JSON.parse(data)
        if (dataJSON.title == 'start') {
            myGame = new game.Board()
            gameUpdates = setInterval(() => {
                let isUpdateAvailable = myGame.isUpdateAvailable
                for (let client of wsServer.clients) {
                    if (!isUpdateAvailable) {
                        let playerDots = myGame.getPlayerDots(client.id)

                        let move = [...playerDots, ...myGame.getPlayerDots('#')]
                        .filter(dot => !Array.isArray(dot))
                        .map(dot => myGame.getDotCoords(dot))
                        .find(dot => dot.x == movesMap[client.id]?.x && dot.y == movesMap[client.id]?.y)
                         ?? myGame.getDotCoords(playerDots[Math.floor(Math.random() * playerDots.length)])

                        if (move != undefined) {
                            myGame.addValue(move.x, move.y, 1, client.id)
                        }
                        movesMap[client.id] = null
                    }
                }
                myGame.update()


                for (let client of wsServer.clients) {
                    client.send(myGame.boardJSON)
                }
            }, DELAY)
        } else if (dataJSON.title == 'move') {
            movesMap[wsClient.id] = dataJSON.move
        } else if (dataJSON.title = 'stop') {
            clearInterval(gameUpdates)
            myGame = null
        }
    })
    

})
