import {Piece} from "./Piece";

export class SearchResult {
  pieces: Array<Piece>;

  constructor(pieces: Array<Piece>) {
    this.pieces = pieces;
  }
}
