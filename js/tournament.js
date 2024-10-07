export class Tournament {
    constructor(players) {
        this.players = players;
        this.matches = [];
        this.winners = [];
        this.mode = players.length === 3 ? 'all_vs_all' : 'knockout';
        this.winCounts = {};

        this.players.forEach(player => {
            this.winCounts[player] = 0;
        });
    }

    startTournament() {
        if (this.mode === 'knockout') {
            if (this.players.length < 3) {
                console.log("Necesita 3 o + jugadores");
                return;
            }
            this.knockoutMatches();
        } else {
            this.allVsAllMatches();
        }
    }

    allVsAllMatches() {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                this.matches.push([this.players[i], this.players[j]]);
            }
        }
        this.playNextMatch();
    }

    knockoutMatches() {
        let round = [...this.players];
        while (round.length > 1) {
            let nextRound = [];
            this.matches = [];
    
            if (round.length % 2 !== 0) {
                // si es impar hacer pasar a uno random a la sig ronda
                const randomIndex = Math.floor(Math.random() * round.length);
                const autoAdvancePlayer = round[randomIndex];
                nextRound.push(autoAdvancePlayer);
                console.log(`El jugador ${autoAdvancePlayer} avanza automáticamente a la siguiente ronda.`);
    
                // eliminar el que avanza directo
                round.splice(randomIndex, 1);
            }
            //prox matches
            for (let i = 0; i < round.length; i += 2) {
                if (round[i + 1]) {
                    // Crear partido si hay un segundo jugador
                    this.matches.push([round[i], round[i + 1]]);
                    console.log(`Partido: ${round[i]} vs ${round[i + 1]}`);
                }
            }

            for (let match of this.matches) {
                this.playMatch(match[0], match[1], (winner) => {
                    console.log(`Ganador entre ${match[0]} y ${match[1]} es ${winner}`);
                    nextRound.push(winner);
                });
            }
            // next round
            this.matches = [];
            round = nextRound;
            this.winners = [];
        }
        if (round.length === 1) {
            console.log(`GANADOR TORNEO: ${round[0]}`);
        }
    }

    determineWinner() {
        const winner = Object.keys(this.winCounts).reduce((a, b) => this.winCounts[a] > this.winCounts[b] ? a : b);
        console.log(`El ganador del torneo por cantidad de partidos ganados es: ${winner}`);
    }

    playNextMatch() {
        if (this.matches.length === 0) {
            console.log("Torneo terminado.");
            if (this.mode === 'all_vs_all') {
                this.determineWinner();
            }
            return;
        }

        const [player1, player2] = this.matches.shift();
        console.log(`Partido entre ${player1} y ${player2}`);
        this.playMatch(player1, player2, (winner) => {
            console.log(`Ganador entre ${player1} y ${player2} es ${winner}`);
            this.winners.push(winner);
            this.playNextMatch();
        });
    }

    // playMatch(player1, player2, onFinish) {
    //     const game = new Game('canvasId');

    //     game.player1Name = player1;
    //     game.player2Name = player2;
    // }

    playMatch(player1, player2, onFinish) {
        // Simula ganador aleatorio
        const winner = Math.random() < 0.5 ? player1 : player2; // 50% de probabilidad
        
        //agregar la partida ganada
        this.winCounts[winner]++;

        onFinish(winner);
    }

    
}
