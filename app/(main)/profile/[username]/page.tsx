// app/@username/page.tsx (or wherever your profile page is)
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { getUserByUsername } from "@/lib/services/userService";
import { getPostsByAuthor } from "@/lib/services/postService";
import { useAuth } from "@/lib/context/AuthContext";
import { User, Post } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post/PostCard";

import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

import { format } from "date-fns";
import FollowButton from "@/components/profile/FollowButton";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        const user = await getUserByUsername(username);
        if (!user) {
          setError("User not found");
          return;
        }

        setProfileUser(user);
        const userPosts = await getPostsByAuthor(user.uid, false);
        setPosts(userPosts);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const isOwnProfile = currentUser?.uid === profileUser?.uid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">{error || "User not found"}</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const joinDate = profileUser.createdAt
    ? format(
        profileUser.createdAt instanceof Date
          ? profileUser.createdAt
          : profileUser.createdAt.toDate(),
        "MMMM yyyy"
      )
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header - Fully Responsive */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <Avatar className="w-20 h-20 sm:w-32 sm:h-32 ring-4 ring-white shrink-0">
              <AvatarImage src={profileUser.photoURL || ""} alt={profileUser.displayName} />
              <AvatarFallback className="text-3xl sm:text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {profileUser.displayName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Info Column */}
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profileUser.displayName}
              </h1>
              <p className="text-lg text-gray-600">@{profileUser.username}</p>

              {/* Bio */}
              {profileUser.bio && (
                <p className="mt-4 text-gray-700 text-base leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
                {profileUser.website && (
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600 transition"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="underline">Website</span>
                  </a>
                )}
              </div>

              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-center sm:text-left">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profileUser.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profileUser.followingCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.length}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6">
                {isOwnProfile ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/profile/edit" className="w-full sm:w-auto">
                      <Button className="w-full">Edit Profile</Button>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <FollowButton
                    userId={profileUser.uid}
                    initialFollowersCount={profileUser.followersCount || 0}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Posts Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Posts ({posts.length})
        </h2>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-10 text-center">
              <p className="text-gray-600 text-lg">
                {isOwnProfile
                  ? "You haven't published any posts yet."
                  : "This user hasn't published any posts yet."}
              </p>
              {isOwnProfile && (
                <Link href="/write">
                  <Button className="mt-6">Write Your First Post</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}