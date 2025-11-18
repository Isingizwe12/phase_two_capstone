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

export async function checkIfLiked(
  postId: string,
  userId: string
): Promise<string | null> {
  try {
    console.log('Checking if liked:', { postId, userId });
    
    const q = query(
      collection(db, 'likes'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('Already liked, ID:', querySnapshot.docs[0].id);
      return querySnapshot.docs[0].id;
    }

    console.log('Not liked yet');
    return null;
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
}

export async function toggleLike(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('=== TOGGLE LIKE (SIMPLIFIED) ===');
    console.log('PostId:', postId);
    console.log('UserId:', userId);
    
    // Check if already liked
    const existingLike = await checkIfLiked(postId, userId);
    
    if (existingLike) {
      // UNLIKE
      console.log('Unliking... deleting doc:', existingLike);
      await deleteDoc(doc(db, 'likes', existingLike));
      console.log('✅ Unlike successful');
      
      // Update post count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(-1),
      });
      
      return false;
    } else {
      // LIKE
      console.log('Liking... creating new doc');
      const likeData = {
        postId: postId,
        userId: userId,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'likes'), likeData);
      console.log('✅ Like created:', docRef.id);
      
      // Update post count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(1),
      });
      
      return true;
    }
  } catch (error: any) {
    console.error('❌ Toggle like failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

export async function getLikeCount(postId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'likes'),
      where('postId', '==', postId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
}