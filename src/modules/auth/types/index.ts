export type JwtPayload = {
  sub: string;
  roles: string[];
  email?: string;
};
