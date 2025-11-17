// Import Firestore functions
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';

// Import database instance
import { db } from '@/lib/firebase/config';

/**
 * Check if user has already liked a post
 * @param postId - Post to check
 * @param userId - User to check
 * @returns Promise with like document ID if exists, null if not
 */
export async function checkIfLiked(
  postId: string,
  userId: string
): Promise<string | null> {
  try {
    // Query 'likes' collection for this user + post combination
    const q = query(
      collection(db, 'likes'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    // If like exists, return its ID
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    // No like found
    return null;
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
}

/**
 * Like a post
 * Creates a like document and increments post like count
 * @param postId - Post to like
 * @param userId - User who is liking
 * @returns Promise with like document ID
 */
export async function likePost(
  postId: string,
  userId: string
): Promise<string> {
  try {
    // First check if already liked (prevent duplicate likes)
    const existingLike = await checkIfLiked(postId, userId);
    if (existingLike) {
      return existingLike; // Already liked, return existing like ID
    }

    // Create like document in 'likes' collection
    const likeData = {
      postId,                       // Which post
      userId,                       // Who liked it
      createdAt: serverTimestamp(), // When
    };

    const docRef = await addDoc(collection(db, 'likes'), likeData);

    // Increment the post's like count
    // This updates likesCount in the post document
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likesCount: increment(1), // Increase by 1
    });

    return docRef.id;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

/**
 * Unlike a post
 * Deletes the like document and decrements post like count
 * @param postId - Post to unlike
 * @param userId - User who is unliking
 */
export async function unlikePost(
  postId: string,
  userId: string
): Promise<void> {
  try {
    // Find the like document
    const likeId = await checkIfLiked(postId, userId);

    if (!likeId) {
      throw new Error('Like not found');
    }

    // Delete the like document
    const likeRef = doc(db, 'likes', likeId);
    await deleteDoc(likeRef);

    // Decrement the post's like count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likesCount: increment(-1), // Decrease by 1
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

/**
 * Toggle like (like if not liked, unlike if already liked)
 * This is a convenience function that calls likePost or unlikePost
 * @param postId - Post to toggle like on
 * @param userId - User toggling the like
 * @returns Promise with boolean (true = now liked, false = now unliked)
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check current like status
    const existingLike = await checkIfLiked(postId, userId);

    if (existingLike) {
      // Already liked, so unlike it
      await unlikePost(postId, userId);
      return false; // Now unliked
    } else {
      // Not liked yet, so like it
      await likePost(postId, userId);
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Get like count for a post
 * @param postId - Post to count likes for
 * @returns Promise with number of likes
 */
export async function getLikeCount(postId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'likes'),
      where('postId', '==', postId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size; // Number of documents = number of likes
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
}