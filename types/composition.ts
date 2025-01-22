export interface User {
  username: string;
}

export interface License {
    _id: string;
    name: string;
    price: number;
}

export interface Composition {
  _id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  tags: string[];
  price: number;
  file: string;
  coverImage: string;
  user: User;
  licenses: License[];
  listens: string[];
  createdAt: string;
}