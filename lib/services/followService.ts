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
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';

export async function checkIfFollowing(
  followerId: string,
  followingId: string
): Promise<string | null> {
  try {
    console.log('=== CHECK IF FOLLOWING ===');
    console.log('Follower ID:', followerId);
    console.log('Following ID:', followingId);

    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('✅ Already following, ID:', querySnapshot.docs[0].id);
      return querySnapshot.docs[0].id;
    }

    console.log('❌ Not following yet');
    return null;
  } catch (error) {
    console.error('❌ Error checking follow status:', error);
    throw error;
  }
}

export async function followUser(
  followerId: string,
  followingId: string
): Promise<string> {
  try {
    console.log('=== FOLLOW USER ===');
    console.log('Follower ID:', followerId);
    console.log('Following ID:', followingId);

    const existingFollow = await checkIfFollowing(followerId, followingId);
    if (existingFollow) {
      console.log('Already following, returning existing');
      return existingFollow;
    }

    const followData = {
      followerId: followerId,
      followingId: followingId,
      createdAt: serverTimestamp(),
    };

    console.log('Creating follow document with data:', followData);

    const docRef = await addDoc(collection(db, 'follows'), followData);
    console.log('✅ Follow document created:', docRef.id);

    // Update follower count
    console.log('Updating follower count...');
    const followingUserRef = doc(db, 'users', followingId);
    await updateDoc(followingUserRef, {
      followersCount: increment(1),
    });
    console.log('✅ Follower count updated');

    // Update following count
    console.log('Updating following count...');
    const followerUserRef = doc(db, 'users', followerId);
    await updateDoc(followerUserRef, {
      followingCount: increment(1),
    });
    console.log('✅ Following count updated');

    return docRef.id;
  } catch (error: any) {
    console.error('❌ ERROR FOLLOWING USER');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  try {
    console.log('=== UNFOLLOW USER ===');
    console.log('Follower ID:', followerId);
    console.log('Following ID:', followingId);

    const followId = await checkIfFollowing(followerId, followingId);

    if (!followId) {
      throw new Error('Follow relationship not found');
    }

    console.log('Deleting follow document:', followId);
    const followRef = doc(db, 'follows', followId);
    await deleteDoc(followRef);
    console.log('✅ Follow document deleted');

    // Decrement follower count
    console.log('Decrementing follower count...');
    const followingUserRef = doc(db, 'users', followingId);
    await updateDoc(followingUserRef, {
      followersCount: increment(-1),
    });
    console.log('✅ Follower count decremented');

    // Decrement following count
    console.log('Decrementing following count...');
    const followerUserRef = doc(db, 'users', followerId);
    await updateDoc(followerUserRef, {
      followingCount: increment(-1),
    });
    console.log('✅ Following count decremented');
  } catch (error: any) {
    console.error('❌ ERROR UNFOLLOWING USER');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    console.log('=== TOGGLE FOLLOW ===');
    console.log('Follower ID:', followerId);
    console.log('Following ID:', followingId);

    const existingFollow = await checkIfFollowing(followerId, followingId);

    if (existingFollow) {
      console.log('Exists, unfollowing...');
      await unfollowUser(followerId, followingId);
      return false;
    } else {
      console.log('Does not exist, following...');
      await followUser(followerId, followingId);
      return true;
    }
  } catch (error) {
    console.error('❌ Error toggling follow:', error);
    throw error;
  }
}