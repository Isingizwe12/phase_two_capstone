
// Import Firestore functions
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
} from 'firebase/firestore';

// Import database instance
import { db } from '@/lib/firebase/config';

// Import TypeScript types
import { User } from '@/types';

/**
 * Get user data by user ID
 * @param userId - User ID to fetch
 * @returns Promise with user data or null
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Get document reference for this user
    const userRef = doc(db, 'users', userId);
    
    // Fetch the document
    const userSnap = await getDoc(userRef);

    // Check if user exists
    if (userSnap.exists()) {
      return {
        uid: userSnap.id,
        ...userSnap.data(),
      } as User;
    }

    // User not found
    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

/**
 * Get user data by username
 * @param username - Username to search for
 * @returns Promise with user data or null
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    // Create query to find user with this username
    // usernames are stored in lowercase
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase()),
      limit(1) // We only need one result
    );

    // Execute query
    const querySnapshot = await getDocs(q);

    // Check if user found
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        uid: userDoc.id,
        ...userDoc.data(),
      } as User;
    }

    // User not found
    return null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
}

/**
 * Check if username is already taken
 * Useful for signup validation
 * @param username - Username to check
 * @returns Promise with boolean (true = taken, false = available)
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username);
    return user !== null; // If user exists, username is taken
  } catch (error) {
    console.error('Error checking username:', error);
    return true; // Assume taken if error (safer)
  }
}