// app/(main)/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: '',
    website: '',
    twitter: '',
    github: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: '', // We'll need to fetch this from Firestore
        photoURL: user.photoURL || '',
        website: '',
        twitter: '',
        github: '',
      });

      // Fetch full user data from Firestore
      const fetchUserData = async () => {
        try {
          const { getUserById } = await import('@/lib/services/userService');
          const userData = await getUserById(user.uid);
          
          if (userData) {
            setFormData({
              displayName: userData.displayName || '',
              bio: userData.bio || '',
              photoURL: userData.photoURL || '',
              website: userData.website || '',
              twitter: userData.twitter || '',
              github: userData.github || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        photoURL: formData.photoURL.trim(),
        website: formData.website.trim(),
        twitter: formData.twitter.trim(),
        github: formData.github.trim(),
        updatedAt: new Date(),
      });

      setSuccess('Profile updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/profile/${user.username}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your profile information</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">This is how your name will appear on posts and comments</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={loading}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <Label htmlFor="photoURL">Profile Photo URL</Label>
                <Input
                  id="photoURL"
                  name="photoURL"
                  type="url"
                  value={formData.photoURL}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  disabled={loading}
                />
                {formData.photoURL && (
                  <div className="mt-2">
                    <img
                      src={formData.photoURL}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  disabled={loading}
                />
              </div>

              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter Username</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  type="text"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@yourusername"
                  disabled={loading}
                />
              </div>

              {/* GitHub */}
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Username</Label>
                <Input
                  id="github"
                  name="github"
                  type="text"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="yourusername"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/profile/${user.username}`}>
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}