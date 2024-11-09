//TODO: if 1 pl -> 1 vs com
//      if 2 pl -> double play
//      if >= 3 -> tournament all_vs_all / knockout
import {Game, Message} from './pong';

export class Tournament {
    constructor(players) {
        this.players = players;
        this.matches = [];
        this.winners = [];
        this.mode = this.setMode();
        this.winCounts = {};
        this.tournamentWinner = null;
        let gameFinished = false;

        this.players.forEach(player => {
            this.winCounts[player] = 0;
        });
    }

    setMode() {
        const players = this.players.length;

        if (players === 1) {
            return 'solo_play';
        } else if (players === 2) {
            return 'double_play';
        } else if (players === 3) {
            return 'all_vs_all';
        } else {
            return 'knockout';
        }
    }

    startTournament() {
        switch (this.mode) {
            case 'solo_play':
                console.log("Modo 1 jugador vs computadora.");
                this.soloPlayGame();
                break;
            case 'double_play':
                console.log("Modo 1 vs 1.");
                this.doublePlayGame();
                break;
            case 'all_vs_all':
                console.log("Modo todos contra todos.");
                this.allVsAllMatches();
                break;
            case 'knockout':
                console.log("Modo eliminatorio.");
                this.knockoutMatches();
                break;
    }
}
    // startTournament() {
    //     if (this.mode === 'knockout') {
    //         if (this.players.length < 3) {
    //             console.log("Necesita 3 o + jugadores");
    //             return;
    //         }
    //         this.knockoutMatches();
    //     } else {
    //         this.allVsAllMatches();
    //     }
    // }
    soloPlayGame() {
        console.log(this.mode);
        const game = new Game('canvas', this.mode, this.players[0], "Computer");
        game.init();
    }

    doublePlayGame() {
        const game = new Game('canvas', this.mode, this.players[0], this.players[1]);
        game.init();
    }

    allVsAllMatches() {
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                this.matches.push([this.players[i], this.players[j]]);
                console.log(`Partido programado: ${this.players[i]} vs ${this.players[j]}`);
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
                    // console.log(`Partido: ${round[i]} vs ${round[i + 1]}`);
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
        this.tournamentWinner = winner;
        // this.tournamentWinner = Object.keys(this.winCounts).reduce((a, b) => this.winCounts[a] > this.winCounts[b] ? a : b);
        // console.log(`El ganador del torneo por cantidad de partidos ganados es: ${this.tournamentWinner}`);
    }

    // playNextMatch() {
    //     if (this.matches.length === 0) {
    //         console.log("Torneo terminado.");
    //         if (this.mode === 'all_vs_all') {
    //             this.determineWinner();
    //         }
    //         return;
    //     }

    //     const [player1, player2] = this.matches.shift();
    //     // console.log(`Partido entre ${player1} y ${player2}`);
    //     this.playMatch(player1, player2, (winner) => {
    //         console.log(`Ganador entre ${player1} y ${player2} es ${winner}`);
    //         this.winners.push(winner);
    //         this.playNextMatch();
    //     });
    // }

    // playMatch(player1, player2, onFinish) {
    // //     // // Simula ganador aleatorio
    // //     // const winner = Math.random() < 0.5 ? player1 : player2; // 50% de probabilidad
    // //     // //agregar la partida ganada
    // //     // this.winCounts[winner]++;
    // //     // onFinish(winner);

    // //     // PRUEBA
    //     const game = new Game('canvas', this.mode, player1, player2);
    //     game.init();

    //     // Esperar a que el juego termine
    //     const checkGameOver = setInterval(() => {
    //         if (game.isGameOver) {
    //             clearInterval(checkGameOver); // Detener chequeo
    //             game.endGame((winner) => {
    //                 console.log(`Ganador entre ${player1} y ${player2} es ${winner}`);
    //                 this.winCounts[winner]++;
    //                 onFinish(winner);
    //             });
    //         }
    //     }, 100);
    // }
    
    handleNextMatch(onNextMatch) {
        const handleKeyN = (evt) => {
            if (evt.code === "KeyN") {
                document.removeEventListener("keydown", handleKeyN); // Evita escuchar más veces
                if (onNextMatch) onNextMatch(); // Llama a la función de callback para continuar con el siguiente partido
            }
        };
        document.addEventListener("keydown", handleKeyN); // Agrega el evento de escucha para la tecla 'N'
    }

    playMatch(player1, player2, onFinish) {
        const game = new Game('canvas', this.mode, player1, player2);
        game.init();

        const checkGameOver = setInterval(() => {
            if (game.isGameOver) {
                clearInterval(checkGameOver); // Detener chequeo
                game.endGame((winner) => {
                    console.log(`Ganador entre ${player1} y ${player2} es ${winner}`);
                    this.winCounts[winner]++;
                    // Llamamos al onFinish para continuar con el siguiente partido
                    onFinish(winner);
                }, this.handleNextMatch.bind(this));
            }
        }, 100);
    }

    playNextMatch() {
        // if (this.matches.length === 0) {
        //     console.log("Torneo terminado.");
        //     if (this.mode === 'all_vs_all') {
        //         this.determineWinner();
        //     }
        //     return ;
        // }
        if (this.matches.length === 0) {
            console.log("Torneo terminado.");
    
            // Establece el ganador del torneo antes del último partido
            if (this.mode === 'all_vs_all') {
                this.determineWinner();
            } else if (this.mode === 'knockout' && this.winners.length > 0) {
                this.tournamentWinner = this.winners[this.winners.length - 1];
            }
            console.log("WINNERRRRR: ", this.tournamentWinner);
            const finalGame = new Game('canvas', this.mode, null, null); // Creamos una instancia de juego final sin jugadores reales
            finalGame.endGame(
                () => {},
                () => {},
                true, // Indicamos que es el último "partido" o mensaje final
                this.tournamentWinner // Pasamos el ganador del torneo
            );
    
            return;
        }
    
        const [player1, player2] = this.matches.shift();
        console.log(`Partido entre ${player1} y ${player2}`);
        
        this.playMatch(player1, player2, (winner) => {
            console.log(`Ganador entre ${player1} y ${player2} es ${winner}`);
            this.winners.push(winner);
    
            // Llamamos a handleNextMatch que se encargará de esperar la tecla 'N'
            this.handleNextMatch(() => {
                // Llamar playNextMatch para continuar con el siguiente partido
                this.playNextMatch();
            });
        });
    }

}
