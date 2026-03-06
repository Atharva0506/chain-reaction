package game

import (
	"math"
	"math/rand"
)

type AIBot struct {
	engine *Engine
}

func NewAIBot(engine *Engine) *AIBot {
	return &AIBot{engine: engine}
}

func (ai *AIBot) GetMove(board Board, player Player, players []Player, difficulty string, turnNumber int) Position {
	switch difficulty {
	case "easy":
		return ai.easyMove(board, player.Color)
	case "medium":
		return ai.mediumMove(board, player, players, turnNumber)
	case "hard":
		return ai.hardMove(board, player, players, turnNumber)
	default:
		return ai.easyMove(board, player.Color)
	}
}

func (ai *AIBot) easyMove(board Board, color PlayerColor) Position {
	moves := ai.validMoves(board, color)
	rows := len(board)
	cols := len(board[0])
	safe := make([]Position, 0)
	for _, m := range moves {
		mass := ai.engine.GetCriticalMass(m.Row, m.Col, rows, cols)
		if board[m.Row][m.Col].Orbs < mass-1 {
			safe = append(safe, m)
		}
	}
	if len(safe) > 0 {
		return safe[rand.Intn(len(safe))]
	}
	return moves[rand.Intn(len(moves))]
}

func (ai *AIBot) mediumMove(board Board, player Player, players []Player, turnNumber int) Position {
	moves := ai.validMoves(board, player.Color)
	bestScore := math.Inf(-1)
	bestMove := moves[0]
	rows := len(board)
	cols := len(board[0])

	for _, m := range moves {
		result, _ := ai.engine.ApplyMove(ai.engine.cloneBoard(board), m, player.Color)
		score := ai.evaluate(result, player.Color, players, rows, cols)
		if score > bestScore {
			bestScore = score
			bestMove = m
		}
	}
	return bestMove
}

func (ai *AIBot) hardMove(board Board, player Player, players []Player, turnNumber int) Position {
	moves := ai.validMoves(board, player.Color)
	bestScore := math.Inf(-1)
	bestMove := moves[0]

	for _, m := range moves {
		result, _ := ai.engine.ApplyMove(ai.engine.cloneBoard(board), m, player.Color)
		score := ai.minimax(result, 2, false, math.Inf(-1), math.Inf(1), player, players, turnNumber+1)
		if score > bestScore {
			bestScore = score
			bestMove = m
		}
	}
	return bestMove
}

func (ai *AIBot) minimax(board Board, depth int, maximizing bool, alpha, beta float64, aiPlayer Player, players []Player, turnNumber int) float64 {
	rows := len(board)
	cols := len(board[0])

	winner := ai.engine.CheckWinner(board, players, turnNumber)
	if winner != nil {
		if winner.ID == aiPlayer.ID {
			return 10000
		}
		return -10000
	}
	if depth == 0 {
		return ai.evaluate(board, aiPlayer.Color, players, rows, cols)
	}

	currentIdx := turnNumber % len(players)
	currentPlayer := players[currentIdx]
	moves := ai.validMoves(board, currentPlayer.Color)
	if len(moves) == 0 {
		return 0
	}

	if len(moves) > 8 {
		rand.Shuffle(len(moves), func(i, j int) { moves[i], moves[j] = moves[j], moves[i] })
		moves = moves[:8]
	}

	if maximizing {
		maxEval := math.Inf(-1)
		for _, m := range moves {
			result, _ := ai.engine.ApplyMove(ai.engine.cloneBoard(board), m, currentPlayer.Color)
			eval := ai.minimax(result, depth-1, false, alpha, beta, aiPlayer, players, turnNumber+1)
			maxEval = math.Max(maxEval, eval)
			alpha = math.Max(alpha, eval)
			if beta <= alpha {
				break
			}
		}
		return maxEval
	}

	minEval := math.Inf(1)
	for _, m := range moves {
		result, _ := ai.engine.ApplyMove(ai.engine.cloneBoard(board), m, currentPlayer.Color)
		eval := ai.minimax(result, depth-1, true, alpha, beta, aiPlayer, players, turnNumber+1)
		minEval = math.Min(minEval, eval)
		beta = math.Min(beta, eval)
		if beta <= alpha {
			break
		}
	}
	return minEval
}

func (ai *AIBot) evaluate(board Board, myColor PlayerColor, players []Player, rows, cols int) float64 {
	var score float64
	myOrbs, myCells := 0, 0
	enemyOrbs, enemyCells := 0, 0

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			cell := board[r][c]
			if cell.Orbs == 0 || cell.Owner == nil {
				continue
			}
			if *cell.Owner == myColor {
				myOrbs += cell.Orbs
				myCells++
				mass := ai.engine.GetCriticalMass(r, c, rows, cols)
				if cell.Orbs == mass-1 {
					score += 5
					if mass == 2 {
						score += 3
					}
				}
			} else {
				enemyOrbs += cell.Orbs
				enemyCells++
			}
		}
	}

	score += float64(myOrbs-enemyOrbs) * 2
	score += float64(myCells-enemyCells) * 3
	return score
}

func (ai *AIBot) validMoves(board Board, color PlayerColor) []Position {
	rows := len(board)
	cols := len(board[0])
	moves := make([]Position, 0)
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			pos := Position{Row: r, Col: c}
			if ai.engine.IsValidMove(board, pos, color) {
				moves = append(moves, pos)
			}
		}
	}
	return moves
}
