package game

type Engine struct{}

func NewEngine() *Engine {
	return &Engine{}
}

func (e *Engine) CreateEmptyBoard(rows, cols int) Board {
	board := make(Board, rows)
	for r := 0; r < rows; r++ {
		board[r] = make([]Cell, cols)
		for c := 0; c < cols; c++ {
			board[r][c] = Cell{Orbs: 0, Owner: nil}
		}
	}
	return board
}

func (e *Engine) GetCriticalMass(row, col, rows, cols int) int {
	edges := 0
	if row == 0 {
		edges++
	}
	if row == rows-1 {
		edges++
	}
	if col == 0 {
		edges++
	}
	if col == cols-1 {
		edges++
	}
	if edges >= 2 {
		return 2
	}
	if edges == 1 {
		return 3
	}
	return 4
}

func (e *Engine) GetNeighbors(row, col, rows, cols int) []Position {
	neighbors := make([]Position, 0, 4)
	if row > 0 {
		neighbors = append(neighbors, Position{Row: row - 1, Col: col})
	}
	if row < rows-1 {
		neighbors = append(neighbors, Position{Row: row + 1, Col: col})
	}
	if col > 0 {
		neighbors = append(neighbors, Position{Row: row, Col: col - 1})
	}
	if col < cols-1 {
		neighbors = append(neighbors, Position{Row: row, Col: col + 1})
	}
	return neighbors
}

func (e *Engine) IsValidMove(board Board, pos Position, color PlayerColor) bool {
	if pos.Row < 0 || pos.Row >= len(board) || pos.Col < 0 || pos.Col >= len(board[0]) {
		return false
	}
	cell := board[pos.Row][pos.Col]
	return cell.Owner == nil || *cell.Owner == color
}

func (e *Engine) ApplyMove(board Board, pos Position, color PlayerColor) (Board, []BoardDiff) {
	rows := len(board)
	cols := len(board[0])
	current := e.cloneBoard(board)
	steps := make([]BoardDiff, 0)

	current[pos.Row][pos.Col].Orbs++
	c := color
	current[pos.Row][pos.Col].Owner = &c

	initChange := CellDiff{
		Row:   pos.Row,
		Col:   pos.Col,
		Orbs:  current[pos.Row][pos.Col].Orbs,
		Owner: &c,
	}

	unstable := e.findUnstable(current, rows, cols)

	if len(unstable) == 0 {
		steps = append(steps, BoardDiff{
			Changes:    []CellDiff{initChange},
			Explosions: nil,
		})
		return current, steps
	}

	steps = append(steps, BoardDiff{
		Changes:    []CellDiff{initChange},
		Explosions: nil,
	})

	maxIter := rows * cols * 4
	iter := 0

	for len(unstable) > 0 && iter < maxIter {
		iter++
		changes := make([]CellDiff, 0)
		explosions := make([]Position, len(unstable))
		copy(explosions, unstable)

		for _, p := range unstable {
			mass := e.GetCriticalMass(p.Row, p.Col, rows, cols)
			current[p.Row][p.Col].Orbs -= mass
			if current[p.Row][p.Col].Orbs <= 0 {
				current[p.Row][p.Col].Orbs = 0
				current[p.Row][p.Col].Owner = nil
			}
			changes = append(changes, CellDiff{
				Row:   p.Row,
				Col:   p.Col,
				Orbs:  current[p.Row][p.Col].Orbs,
				Owner: current[p.Row][p.Col].Owner,
			})

			neighbors := e.GetNeighbors(p.Row, p.Col, rows, cols)
			for _, n := range neighbors {
				current[n.Row][n.Col].Orbs++
				nc := color
				current[n.Row][n.Col].Owner = &nc
				changes = append(changes, CellDiff{
					Row:   n.Row,
					Col:   n.Col,
					Orbs:  current[n.Row][n.Col].Orbs,
					Owner: &nc,
				})
			}
		}

		steps = append(steps, BoardDiff{
			Changes:    changes,
			Explosions: explosions,
		})

		unstable = e.findUnstable(current, rows, cols)
	}

	return current, steps
}

func (e *Engine) CheckWinner(board Board, players []Player, turnNumber int) *Player {
	if turnNumber < len(players) {
		return nil
	}

	activeColors := make(map[PlayerColor]bool)
	rows := len(board)
	cols := len(board[0])
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if board[r][c].Orbs > 0 && board[r][c].Owner != nil {
				activeColors[*board[r][c].Owner] = true
			}
		}
	}

	if len(activeColors) == 1 {
		for color := range activeColors {
			for i := range players {
				if players[i].Color == color {
					return &players[i]
				}
			}
		}
	}

	return nil
}

func (e *Engine) findUnstable(board Board, rows, cols int) []Position {
	unstable := make([]Position, 0)
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if board[r][c].Orbs >= e.GetCriticalMass(r, c, rows, cols) {
				unstable = append(unstable, Position{Row: r, Col: c})
			}
		}
	}
	return unstable
}

func (e *Engine) cloneBoard(board Board) Board {
	rows := len(board)
	cols := len(board[0])
	clone := make(Board, rows)
	for r := 0; r < rows; r++ {
		clone[r] = make([]Cell, cols)
		for c := 0; c < cols; c++ {
			clone[r][c] = Cell{Orbs: board[r][c].Orbs, Owner: board[r][c].Owner}
			if board[r][c].Owner != nil {
				o := *board[r][c].Owner
				clone[r][c].Owner = &o
			}
		}
	}
	return clone
}
