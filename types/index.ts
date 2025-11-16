import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface UserProfile extends Omit<User, 'email'> {
  isFollowing?: boolean;
}

// Post Types
export interface Post {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  status: 'draft' | 'published';
  isDraft: boolean;
  tags: string[];
  readTime: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  publishedAt?: Timestamp | Date | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface PostWithAuthor extends Post {
  author: UserProfile;
}

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  likesCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CommentWithAuthor extends Comment {
  author: UserProfile;
  replies?: CommentWithAuthor[];
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
}

// Like Types
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Timestamp | Date;
}

// Follow Types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Timestamp | Date;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
  createdAt: Timestamp | Date;
}

// Bookmark Types
export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: Timestamp | Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'like' | 'follow' | 'mention';
  actorId: string;
  postId?: string;
  read: boolean;
  message: string;
  createdAt: Timestamp | Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: any;
  total?: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  username: string;
}

export interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  photoURL?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

// Auth Types
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
}