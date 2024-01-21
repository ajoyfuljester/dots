function connect() {
    const host = document.location.host
    const url = 'ws://' + host + '/'
    console.log(url)

    const ws = new WebSocket(url)

    console.log(ws)

    let players = new Set()
    let colors = []
    ws.addEventListener("message", (event) => {
        let gameState = JSON.parse(event.data)

        
        for (let row of gameState) {
            for (let dot of row) {
                players.add(dot.player)
            }
        }

        for (let i = 0; i < players.size; i++) {
            colors[i] = randomColor()
        }

        colors[[...players].findIndex(el => el == '#')] = 'rgb(128 128 128)'
        

        generateHTML(gameState, players, colors)
    });

    document.querySelector('#start').addEventListener('click', e => {
        ws.send(JSON.stringify({title: 'start'}))
    })
    document.querySelector('#stop').addEventListener('click', e => {
        ws.send(JSON.stringify({title: 'stop'}))
    })

    function sendMove(x, y) {
        ws.send(JSON.stringify({title: 'move', move: {x, y}}))
    }

    function generateHTML(state, players, colors) {
        const game = document.querySelector('.board')
        let n = state[0].length * state.length
        for (let y = 0; y < state.length; y++) {
            for (let x = 0; x < state[y].length; x++) {
                let dot = state[y][x]
                let dotHTML = null
                if (game.children.length < n) {
                    dotHTML = document.createElement('div')
                    dotHTML.dataset.x = x
                    dotHTML.dataset.y = y
                    dotHTML.addEventListener('click', e => {
                        sendMove(x, y)
                    })
                    game.appendChild(dotHTML)
                } else {
                    dotHTML = document.querySelector(`[data-x="${x}"][data-y="${y}"]`)
                }
                dotHTML.style.backgroundColor = colors[[...players].findIndex(el => el == dot.player)]
                dotHTML.innerHTML = dot.value

            }
        }
    }
}

function randomColor() {
    return `rgb(${Math.floor(Math.random() * 255)} ${Math.floor(Math.random() * 255)} ${Math.floor(Math.random() * 255)})`
}
