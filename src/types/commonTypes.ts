
 export interface ISession {
    user: {
      id: string
      name?: string | null
      email?: string | null
    }
  }
export interface INote {
  _id: string;
  userId: string; // Added userId
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IUserSession {
  id: string
  name?: string | null
  email?: string | null
}