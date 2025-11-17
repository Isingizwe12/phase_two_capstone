// Import Firestore functions
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  getDoc,
} from 'firebase/firestore';

// Import database instance
import { db } from '@/lib/firebase/config';

// Import TypeScript types
import { Comment, CreateCommentInput } from '@/types';

/**
 * Create a new comment on a post
 * @param data - Comment content and post ID
 * @param authorId - User ID of comment author
 * @returns Promise with new comment ID
 */
export async function createComment(
  data: CreateCommentInput,
  authorId: string
): Promise<string> {
  try {
    // Create comment object
    const commentData = {
      postId: data.postId,         // Which post this comment belongs to
      authorId,                     // Who wrote the comment
      content: data.content,        // The comment text
      parentId: data.parentId || null, // For nested replies (optional)
      likesCount: 0,                // Start with 0 likes
      createdAt: serverTimestamp(), // Firestore timestamp
      updatedAt: serverTimestamp(),
    };

    // Add comment to Firestore 'comments' collection
    const docRef = await addDoc(collection(db, 'comments'), commentData);

    // Increment the post's comment count
    // This updates the commentsCount field in the post document
    const postRef = doc(db, 'posts', data.postId);
    await updateDoc(postRef, {
      commentsCount: increment(1), // Increase by 1
    });

    // Return the new comment's ID
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Get all comments for a specific post
 * @param postId - The post ID to fetch comments for
 * @returns Promise with array of comments
 */
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  try {
    // Create query:
    // - Get from 'comments' collection
    // - Where postId matches
    // - Order by newest first
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    // Execute query
    const querySnapshot = await getDocs(q);

    // Convert Firestore documents to Comment objects
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,           // Document ID
      ...doc.data(),        // Spread all fields (postId, authorId, content, etc.)
    } as Comment));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * @param commentId - ID of comment to delete
 * @param postId - Post ID (to update comment count)
 */
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  try {
    // Delete the comment document
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);

    // Decrement the post's comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1), // Decrease by 1
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Get user data for a comment author
 * Used to display author name and avatar in comments
 * @param userId - User ID to fetch
 * @returns Promise with user data
 */
export async function getUserData(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        uid: userSnap.id,
        ...userSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}