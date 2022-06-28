export class Tag {
  key: string;
  value: string;
  searchable: SearchType;

  constructor(key: string, value: string, searchable: SearchType = SearchType.RANGE) {
    this.key = key;
    this.value = value;
    this.searchable = searchable;
  }
}

export enum SearchType {
  RANGE             = 0,
  NOT_SEARCHABLE    = 1
}
