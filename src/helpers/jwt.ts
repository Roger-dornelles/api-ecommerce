import Jwt from 'jsonwebtoken';

type JwtSignTypes = {
  id: number;
  email: string;
};

export const JwtSign = async ({ id, email }: JwtSignTypes) => {
  let token = Jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: '4h',
  });
  return token;
};

export const JwtVerify = async (token: string) => {
  let tokenVerify = Jwt.verify(token, process.env.JWT_SECRET as string);
  return tokenVerify;
};

export const JwtDecoded = async (token: string) => {
  let decoded = await Jwt.decode(token);
  console.log(decoded);
};
