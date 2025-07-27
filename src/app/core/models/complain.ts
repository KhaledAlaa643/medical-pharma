import { pharmacie } from './pharmacie';
import { sales } from './sales';
import { client } from './client';

export interface complain {
  months(): unknown;

  created_by: person_data;
  body: string;
  created_at: string;
  minutes_waited: number;
  pharmacies: pharmacie;
  user: person_data;
  sales: sales;
  client: client;
  solver: person_data;
  id: number;
  status: string;
  pharmacy: pharmacie;
  role: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export interface person_data {
  id: number;
  name: string;
  role: string[];
  email: string;
  phone: string;
}

export interface solver {}
