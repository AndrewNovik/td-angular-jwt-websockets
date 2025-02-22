export interface UserI {
  id?: number;
  email?: string;
  password?: string;
  username?: string;
}

export interface LoginResponceI {
  access_token: string;
  token_type: string;
  expires_in: number;
}
