// lib/services/postService.ts

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Post, CreatePostInput, UpdatePostInput } from '@/types';

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Helper to calculate read time (rough estimate)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Create a new post
export async function createPost(
  data: CreatePostInput,
  authorId: string
): Promise<string> {
  try {
    const slug = generateSlug(data.title);
    const readTime = calculateReadTime(data.content);

    const postData = {
      authorId,
      title: data.title,
      slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 200),
      coverImage: data.coverImage || '',
      status: data.status,
      isDraft: data.status === 'draft',
      tags: data.tags || [],
      readTime,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      publishedAt: data.status === 'published' ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Get all published posts
export async function getPublishedPosts(limitCount: number = 10): Promise<Post[]> {
  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Post));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Get a single post by ID
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
    }
    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Post;
    }
    return null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}

// Get posts by author
export async function getPostsByAuthor(
  authorId: string,
  includesDrafts: boolean = false
): Promise<Post[]> {
  try {
    let q;
    if (includesDrafts) {
      q = query(
        collection(db, 'posts'),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'posts'),
        where('authorId', '==', authorId),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Post));
  } catch (error) {
    console.error('Error fetching author posts:', error);
    throw error;
  }
}

// Update a post
export async function updatePost(
  postId: string,
  data: Partial<UpdatePostInput>
): Promise<void> {
  try {
    const docRef = doc(db, 'posts', postId);
    
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // If publishing a draft
    if (data.status === 'published') {
      const currentPost = await getPostById(postId);
      if (currentPost?.status === 'draft') {
        updateData.publishedAt = serverTimestamp();
        updateData.isDraft = false;
      }
    }

    // Update slug if title changed
    if (data.title) {
      updateData.slug = `${generateSlug(data.title)}-${Date.now()}`;
    }

    // Update read time if content changed
    if (data.content) {
      updateData.readTime = calculateReadTime(data.content);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

// Delete a post
export async function deletePost(postId: string): Promise<void> {
  try {
    const docRef = doc(db, 'posts', postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Increment view count
export async function incrementViewCount(postId: string): Promise<void> {
  try {
    const docRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(docRef);
    
    if (postSnap.exists()) {
      const currentViews = postSnap.data().viewsCount || 0;
      await updateDoc(docRef, {
        viewsCount: currentViews + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw - view count is not critical
  }
}