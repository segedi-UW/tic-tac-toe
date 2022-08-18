const GameBoard = (() => {
    const empty = -1;
    const board = [];
    for (let i = 0; i < 9; i++) {
        board[i] = empty;
    }
    const reset = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = empty;
        }
    };
    const canPlay = index => {
        return board[index] == empty;
    };

    const play = (index, turn) => {
        board[index] = turn;
    };

    const checkWin = index => {
        // check for win
        // 0 1 2
        // 3 4 5
        // 6 7 8
        // column is index % 3 == 0, 1, 2
        // column = 3n + index % 3

        // row is (n / 3) * 3 - iterate 3
        // truncate int^   ^ get start index and iterate
        // or (index / 3).floor iterate

        const rowStart = ((index - 1) / 3).toFixed(0) * 3;
        const colStart = (index % 3);
        
        console.log({ rowStart, colStart });

        // check row / column 
        let found = board[rowStart];
        for (let i = 1; i < 3; i++) {
            if (found != board[rowStart + i]) {
                break;
            }
            if (i == 2) {
                return true;
            }
        }

        found = board[colStart];
        for (let i = 1; i < 3; i++) {
            if (found != board[colStart + (3 * i)]) {
                break;
            }
            if (i == 2) {
                return true;
            }
        }

        // check diagonal (using properties of indices of 1D matrix representing a 2D matrix)
        if (index % 2 != 0) {
            return false;
        }

        if (index % 4 == 0) {
            // check 0 -> 8 diag
            found = board[0];
            for (let i = 1; i < 3; i++) {
                if (found != board[4*i]) {
                    break;
                }
                if (i == 2) {
                    return true;
                }
            }
        }

        if (index % 2 == 0) {
            // check 2 -> 6 diag
            found = board[2];
            for (let i = 1; i < 3; i++) {
                if (found != board[2 + 2*i]) {
                    break;
                }
                if (i == 2) {
                    return true;
                }
            }
        }

        return false;
    };

    return { play, reset, canPlay, checkWin };
})();

const resetBtn = document.getElementById("ttt-gameboard-reset-btn");
resetBtn.addEventListener("click", () => Game.reset());

const Game = (() => {
    let turn = 0;
    let totalTurns = 0;
    let is_active = false;
    const players = [];

    const reset = () => {
        turn = 0;
        totalTurns = 0;
        GameBoard.reset();
        DisplayController.reset();
        setActive(false);
    };

    const onclick = (index) => {
        if (!is_active)
            return;
        if (players[turn].isBot) {
            DisplayController.error("Not your turn");
            return;
        }
        if (GameBoard.canPlay(index)) {
            GameBoard.play(index, turn);
            DisplayController.onclick(index, turn);
            // earliest win can only happen after 5 turns (including 0)
            if (totalTurns >= 4 && GameBoard.checkWin(index)) {
                DisplayController.show(`${players[turn].name} won!`);
                setActive(false);
                return;
            }

            turn++;
            totalTurns++;
            DisplayController.error("");
            // Last turn is turn 9
            if (totalTurns >= 9) {
                DisplayController.show("It's a draw!");
                setActive(false);
                return;
            }
            if (turn > 1) turn = 0;
            players[turn].play();
        } else {
            DisplayController.error("Cannot set a marked space");
        }
    };

    const setPlayers = (player1, player2) => {
        players[0] = player1;
        players[1] = player2;
        players[turn].play();
    };

    const player1Input = document.getElementById("player1-name");
    const player2Input = document.getElementById("player2-name");

    const start = () => {
        reset();
        const p1Input = player1Input.value != "" ? player1Input.value : "Player 1";
        const p2Input = player2Input.value != "" ? player2Input.value : "Player 2";
        setPlayers(PlayerFactory(p1Input), PlayerFactory(p2Input));
        setActive(true);
        players[turn].play();
    };

    const isActive = () => { return is_active; };

    const startBtn = document.getElementById("ttt-gameboard-start-btn");

    const setActive = (active) => {
        is_active = active;
        if (is_active) {
            resetBtn.removeAttribute("disabled");
            startBtn.setAttribute("disabled", "true");
            player1Input.setAttribute("disabled", "true");
            player2Input.setAttribute("disabled", "true");
        } else {
            resetBtn.setAttribute("disabled", "true");
            startBtn.removeAttribute("disabled");
            player1Input.removeAttribute("disabled");
            player2Input.removeAttribute("disabled");
        }
    };

    return { start, reset, onclick, setPlayers, isActive };
})();

const PlayerFactory = (name, isBot = false) => {
    const play = () => {
        DisplayController.show(`It is ${name}'s turn`);
        if (isBot) {
            // TODO optional - create AI
        }
    };
    return { name, play, isBot };
};

const DisplayController = (() => {
    const gameBoardElement = document.getElementById("ttt-gameboard");
    const spaces = [];
    // init index event listeners
    let spaceIndex = 0;
    for (const n of gameBoardElement.children) {
        if (!n.classList.contains("ttt-gameboard-space")) {
            return;
        }
        const i = spaceIndex++;
        spaces[i] = n;
        n.addEventListener("click", () => Game.onclick(i));
    }
    const reset = () => {
        for (const n of gameBoardElement.children) {
            n.classList.remove("player1-mark", "player2-mark");
        }
        show("");
        error("");
    };
    const onclick = (index, turn) => {
        spaces[index].classList.add(turn == 0 ? "player1-mark" : "player2-mark");
    };

    const notificationElement = document.getElementById("ttt-notification");
    const show = (msg) => {
        notificationElement.innerText = msg;
    };
    const errorElement = document.getElementById("ttt-error");
    const error = (msg) => {
        errorElement.innerText = msg;
    };

    return { reset, onclick, show, error };
})();
