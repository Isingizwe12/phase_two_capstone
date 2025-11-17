'use client';

// React hooks
import { useEffect, useState } from 'react';

// Next.js hooks
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Our service functions
import { getUserByUsername } from '@/lib/services/userService';
import { getPostsByAuthor } from '@/lib/services/postService';

// Auth context
import { useAuth } from '@/lib/context/AuthContext';

// TypeScript types
import { User, Post } from '@/types';

// UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

// Post card component
import PostCard from '@/components/post/PostCard';

// Icons
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, Loader2 } from 'lucide-react';

// Date formatting
import { format } from 'date-fns';

/**
 * Profile Page Component
 * Shows user info and their published posts
 */
export default function ProfilePage() {
  // Get username from URL: /profile/johndoe → username = "johndoe"
  const params = useParams();
  const username = params.username as string;

  const router = useRouter();
  const { user: currentUser } = useAuth(); // Current logged-in user

  // Component state
  const [profileUser, setProfileUser] = useState<User | null>(null); // Profile being viewed
  const [posts, setPosts] = useState<Post[]>([]);                     // User's posts
  const [loading, setLoading] = useState(true);                       // Loading state
  const [error, setError] = useState('');                             // Error message

  /**
   * Fetch user profile and their posts
   * Runs when component mounts or username changes
   */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user by username
        console.log('Fetching user:', username);
        const user = await getUserByUsername(username);

        if (!user) {
          setError('User not found');
          return;
        }

        setProfileUser(user);

        // Fetch user's published posts (not drafts)
        console.log('Fetching posts for user:', user.uid);
        const userPosts = await getPostsByAuthor(user.uid, false); // false = only published
        setPosts(userPosts);

        console.log('Profile loaded:', { user, postsCount: userPosts.length });
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]); // Re-run when username changes

  // Check if viewing own profile
  const isOwnProfile = currentUser?.uid === profileUser?.uid;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format join date
  const joinDate = profileUser.createdAt
    ? format(
        profileUser.createdAt instanceof Date
          ? profileUser.createdAt
          : profileUser.createdAt.toDate(),
        'MMMM yyyy'
      )
    : 'Recently';

  // Render profile page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24">
              {profileUser.photoURL ? (
                <img src={profileUser.photoURL} alt={profileUser.displayName} />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
                  {profileUser.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </Avatar>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profileUser.displayName}</h1>
              <p className="text-gray-600 mt-1">@{profileUser.username}</p>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-gray-700 mt-4">{profileUser.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>

                {/* Social links */}
                {profileUser.website && (
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <span className="font-bold text-gray-900">{profileUser.followersCount || 0}</span>
                  <span className="text-gray-600 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{profileUser.followingCount || 0}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{posts.length}</span>
                  <span className="text-gray-600 ml-1">Posts</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                {isOwnProfile ? (
                  <Link href="/dashboard">
                    <Button>Edit Profile</Button>
                  </Link>
                ) : (
                  <Button>Follow</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Published Posts ({posts.length})
        </h2>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                {isOwnProfile
                  ? "You haven't published any posts yet."
                  : "This user hasn't published any posts yet."}
              </p>
              {isOwnProfile && (
                <Link href="/write">
                  <Button className="mt-4">Write Your First Post</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}