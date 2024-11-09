
# Rules of the Game

This game is a two-player (Red and Green) board game that can be generalized to any number of players.

## Gameplay

The gameplay takes place on an m x n board, commonly sized as 9 x 6. Each cell in the board has a critical mass, defined as the number of orthogonally adjacent cells. For typical cells, the critical mass is 4; for cells on the edge, it's 3, and for corner cells, it's 2. 

## Setup

All cells start as empty. Players take turns placing "orbs" of their respective colors. The Red player can only place red orbs in empty cells or cells containing one or more red orbs. When multiple orbs are placed in a cell, they stack.

## Explosion Mechanism

When a cell's orb count reaches its critical mass, it explodes. The explosion distributes one orb to each orthogonally adjacent cell, and the exploding cell loses orbs equal to its critical mass. The explosions may cause adjacent cells to overload, triggering a chain reaction of explosions until stability is achieved.

## Conversion Rule

When a red cell explodes near green cells, the green cells turn red, and vice versa. This conversion follows the same explosion rules.

## Winning Condition

The game concludes when a player eliminates all orbs belonging to the other players. The remaining player is declared the winner.



