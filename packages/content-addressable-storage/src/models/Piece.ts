import {Tag} from "./Tag";

export class Piece {
  data: Uint8Array;
  tags: Array<Tag>;

  constructor(data: Uint8Array, tags: Array<Tag>) {
    this.data = data;
    this.tags = tags;
  }
}
