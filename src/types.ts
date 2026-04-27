export interface User {
  id: string;
  username: string;
  accountType: 'DEVELOPER' | 'USER';
  isLoggedIn: boolean;
  loginTime: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  price: number;
  basePrice?: number;
  author: string | User;
  code: string;
  tags: string[];
  thumbnailUrl?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  projectId: string;
  project: Project;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  price: number;
  type: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  clientId: string;
  developerId: string;
  messages: Message[];
  unreadForDeveloper: number;
  unreadForClient: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient: User;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  type: 'sale' | 'project' | 'system';
  unread: boolean;
  createdAt: string;
}

export interface SnippetListing {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  price: number;
  rating: number;
  sales: number;
  updatedAt: string;
  language: string;
  type: 'snippet' | 'widget' | 'integration';
  author: string;
  files: WorkspaceSeedFile[];
}

export interface ProjectTemplateDefinition {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  files: WorkspaceSeedFile[];
}

export interface WorkspaceSeedFile {
  id: string;
  name: string;
  language: string;
  content: string;
}
