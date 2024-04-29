// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
    let board = null; // Initialize the chessboard
    const game = new Chess(); // Create new Chess.js game instance
    const moveHistory = document.getElementById('move-history'); // Get move history container
    let moveCount = 1; // Initialize the move count
    let userColor = 'w'; // Initialize the user's color as white
    let lastMove = null; // Initialize last move variable for undo functionality

    // Function to make a random move for the computer
    const makeRandomMove = () => {
        const possibleMoves = game.moves();

        if (game.game_over()) {
            alert("Checkmate!");
        } else {
            const randomIdx = Math.floor(Math.random() * possibleMoves.length);
            const move = possibleMoves[randomIdx];
            game.move(move);
            lastMove = move;
            board.position(game.fen());
            recordMove(move, moveCount); // Record and display the move with move count
            moveCount++; // Increment the move count
        }
    };

    // Function to record and display a move in the move history
    const recordMove = (move, count) => {
        const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}. ${move}` : `${move} -`;
        moveHistory.textContent += formattedMove + ' ';
        moveHistory.scrollTop = moveHistory.scrollHeight; // Auto-scroll to the latest move
    };

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        // Allow the user to drag only their own pieces based on color
        return !game.game_over() && piece.search(userColor) === 0;
    };

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });

        if (move === null) {
            return 'snapback';
        }

        lastMove = move; // Update last move for undo functionality
        window.setTimeout(makeRandomMove, 250);
        recordMove(move.san, moveCount); // Record and display the move with move count
        moveCount++;
    };

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        board.position(game.fen());
    };

    // Function to undo the last move
    const undoMove = () => {
        if (lastMove !== null) {
            game.undo(); // Undo computer's move
            game.undo(); // Undo player's move
            lastMove = null; // Reset last move after undo
            board.position(game.fen());
            moveCount -= 2; // Decrement move count for the undone moves
            // Remove last two moves from move history
            const moves = moveHistory.textContent.trim().split(' ');
            moveHistory.textContent = moves.slice(0, -4).join(' ');
        } else {
            alert("There are no moves to undo!");
        }
    };

    // Configuration options for the chessboard
    const boardConfig = {
        showNotation: true,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    // Initialize the chessboard
    board = Chessboard('board', boardConfig);

    // Event listener for the "Resign" button
    document.querySelector('.resign').addEventListener('click', () => {
        if (confirm("Are you sure you want to resign?")) {
            alert("You resigned!");
            game.reset();
            board.start();
            moveHistory.textContent = '';
            moveCount = 1;
            userColor = 'w';
            lastMove = null; // Reset last move after resignation
            makeRandomMove(); // Computer makes a move after resignation
        }
    });

    // Event listener for the "Play Again" button
    document.querySelector('.play-again').addEventListener('click', () => {
        if (confirm("Are you sure you want to start a new game?")) {
            game.reset();
            board.start();
            moveHistory.textContent = '';
            moveCount = 1;
            userColor = 'w';
            lastMove = null; // Reset last move after starting a new game
        }
    });

    // Event listener for the "Undo Move" button
    document.querySelector('.undo-move').addEventListener('click', () => {
        undoMove();
    });

});
