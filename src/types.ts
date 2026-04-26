export interface User {
  username: string;
  accountType: 'developer' | 'user';
  isLoggedIn: boolean;
  loginTime: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  price: number;
  author: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}
