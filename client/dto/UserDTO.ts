export interface UserDTO {
  username: String;
  score: number;           // total points
  accuracy: number;     // avg accuracy
  totalGuesses: number;    // all guesses ever
  correctGuesses: number;  // all correct guesses ever
  totalGames: number;      // total games played
}
