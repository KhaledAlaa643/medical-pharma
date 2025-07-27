import { pharmacie } from './pharmacie';
import { commonObject } from './settign-enums';

export interface client {
  id: number;
  name: string;
  debt_limit: number;
  remaining_debt_limit: number;
  code: string | null;

  type: commonObject;
  pharmacies: pharmacie[];
  users: users[];
}

export interface users {
  id: number;
  name: string;
  role: string[];
  email: string;
  phone: string;
}
