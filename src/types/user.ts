export type CreateUser = {
  name: string;
  email: string;
  state: string;
  logradouro: string;
  cpf: number;
  contact: number;
  number: number;
  password: string;
};

export type updateUserType = {
  name: string;
  password: string;
  email: string;
  contact: number;
  logradouro: string;
  number: number;
  state: string;
};
