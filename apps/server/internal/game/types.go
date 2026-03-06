package game

const (
	BoardRows = 9
	BoardCols = 6
)

type PlayerColor int

const (
	ColorRed    PlayerColor = 0
	ColorGreen  PlayerColor = 1
	ColorBlue   PlayerColor = 2
	ColorYellow PlayerColor = 3
)

type Cell struct {
	Orbs  int          `json:"orbs"`
	Owner *PlayerColor `json:"owner"`
}

type Position struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type Board [][]Cell

type Player struct {
	ID         string      `json:"id"`
	Name       string      `json:"name"`
	Color      PlayerColor `json:"color"`
	IsAlive    bool        `json:"isAlive"`
	IsBot      bool        `json:"isBot"`
	Difficulty string      `json:"difficulty,omitempty"`
}

type CellDiff struct {
	Row   int          `json:"row"`
	Col   int          `json:"col"`
	Orbs  int          `json:"orbs"`
	Owner *PlayerColor `json:"owner"`
}

type BoardDiff struct {
	Changes    []CellDiff `json:"changes"`
	Explosions []Position `json:"explosions"`
}

type MatchState struct {
	MatchID     string   `json:"matchId"`
	Board       Board    `json:"board"`
	Players     []Player `json:"players"`
	CurrentTurn int      `json:"currentTurn"`
	TurnNumber  int      `json:"turnNumber"`
	Status      string   `json:"status"`
	WinnerID    string   `json:"winnerId,omitempty"`
}
