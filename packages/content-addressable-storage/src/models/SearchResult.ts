import {Piece} from "./Piece.js";

export class SearchResult {
  pieces: Array<Piece>;

  constructor(pieces: Array<Piece>) {
    this.pieces = pieces;
  }
}
