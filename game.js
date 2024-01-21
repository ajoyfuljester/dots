class Board {
    constructor(width = 8, height = 8, dev = 4) {
        this.width = width
        this.height = height
        this.dev = dev

        this.board = []
        this.turn = 0

        for (let y = 0; y < this.height; y++) {
            this.board[y] = []
            for (let x = 0; x < this.width; x++) {
                this.board[y][x] = new Dot()
            }
        }


    }

    get dev() {
        return this.dotExplosionValue
    }

    set dev(val) {
        this.dotExplosionValue = val
    }

    get allDots() {
        let dots = []
        for (let row of this.board) {
            dots.push(...row)
        }

        dots = dots.filter(dot => dot != null)
        return dots
    }

    get boardJSON() {
        return JSON.stringify(this.board)
    }

    get isUpdateAvailable() {
        return this.allDots.some(dot => dot.value >= this.dev)
    }


    setDot(x, y, dot = new Dot()) {
        if (this.getDot(x, y) != undefined) {
            this.board[y][x] = dot;
            return [true, x, y, dot]
        } else {
            return [false, null, null, null]
        }
    }

    getDot(x, y) {
        return this.board[y][x]
    }

    getPlayerDots(player) {
        return this.allDots.filter(dot => dot.player == player)
    }

    getDotCoords(dot) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x] == dot) {
                    return {x, y}
                }
            }
        }
    }

    addValue(x, y, value = 1, player) {
        let dot = this.getDot(x, y)
        if (dot != undefined) {
            dot.value += value;
            if (player != undefined) {
                if (dot.hasChanged && dot.player != player) {
                    dot.player = '#'
                } else {
                    dot.player = player
                }
            }
            dot.hasChanged = true
            return [true, dot]
        } else {
            return [false, null]
        }
    }

    update() {
        let toAddOne = []
        let toErase = []

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.getDot(x, y).value >= this.dev) {
                    toErase.push({x, y})
                    
                    let player = this.getDot(x, y).player
                    toAddOne.push({x: x + 1, y, player})
                    toAddOne.push({x, y: y + 1, player})
                    toAddOne.push({x: x - 1, y, player})
                    toAddOne.push({x, y: y - 1, player})
                }
            }
        }



        for (let i = 0; i < toAddOne.length; i++) {
            let info = toAddOne[i]
            if (info.x < 0 || info.x >= this.width || info.y < 0 || info.y >= this.height) {
                toAddOne[i] = null
            }
        }

        toAddOne = toAddOne.filter(dot => dot != null)


        for (let coords of toErase) {
            this.setDot(coords.x, coords.y)
        }

        for (let coords of toAddOne) {
            this.addValue(coords.x, coords.y, 1, coords.player)
        }


        for (let dot of this.allDots) {
            dot.hasChanged = false
        }

        if (toAddOne.length > 0 || toErase.length > 0) {
            this.turn += 1
        }
    }
}

class Dot {
    constructor(player = '#', value = 0, hasChanged = false) {
        this.player = player
        this.value = value
        this.hasChanged = hasChanged
    }
}

module.exports = {
    Board,
    Dot
}