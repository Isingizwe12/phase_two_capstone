// lib/services/followService.ts

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
  getDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';

/**
 * Check if user is following another user
 */
export async function checkIfFollowing(
  followerId: string,
  followingId: string
): Promise<string | null> {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<string> {
  try {
    // Check if already following
    const existingFollow = await checkIfFollowing(followerId, followingId);
    if (existingFollow) {
      return existingFollow;
    }

    // Create follow document
    const followData = {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'follows'), followData);

    // Update follower count on the followed user
    const followingUserRef = doc(db, 'users', followingId);
    await updateDoc(followingUserRef, {
      followersCount: increment(1),
    });

    // Update following count on the follower
    const followerUserRef = doc(db, 'users', followerId);
    await updateDoc(followerUserRef, {
      followingCount: increment(1),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  try {
    const followId = await checkIfFollowing(followerId, followingId);

    if (!followId) {
      throw new Error('Follow relationship not found');
    }

    // Delete follow document
    const followRef = doc(db, 'follows', followId);
    await deleteDoc(followRef);

    // Decrement follower count
    const followingUserRef = doc(db, 'users', followingId);
    await updateDoc(followingUserRef, {
      followersCount: increment(-1),
    });

    // Decrement following count
    const followerUserRef = doc(db, 'users', followerId);
    await updateDoc(followerUserRef, {
      followingCount: increment(-1),
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Toggle follow (follow if not following, unfollow if following)
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const existingFollow = await checkIfFollowing(followerId, followingId);

    if (existingFollow) {
      await unfollowUser(followerId, followingId);
      return false; // Now unfollowed
    } else {
      await followUser(followerId, followingId);
      return true; // Now following
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
}