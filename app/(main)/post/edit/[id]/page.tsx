// app/(main)/post/edit/[id]/page.tsx

// 'use client' - runs in browser (needs hooks)
'use client';

// React hooks for state and side effects
import { useState, useRef, useMemo, useEffect } from 'react';

// Next.js navigation hooks
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Our custom hooks
import { useAuth } from '@/lib/context/AuthContext';
import { usePost } from '@/lib/hooks/usePosts';

// Service functions to update/delete posts
import { updatePost, deletePost } from '@/lib/services/postService';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Dynamic import for Jodit editor (prevents SSR issues)
import dynamic from 'next/dynamic';

// Icons
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';

// Dynamically import Jodit - won't run on server
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function EditPostPage() {
  // Get post ID from URL: /post/edit/abc123 → id = "abc123"
  const params = useParams();
  const postId = params.id as string;

  // Router for navigation after save/delete
  const router = useRouter();

  // Get current logged-in user
  const { user } = useAuth();

  // Fetch the post we're editing using React Query
  const { data: post, isLoading: postLoading } = usePost(postId);

  // Reference to Jodit editor instance
  const editor = useRef(null);

  // Component state - stores form values
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jodit editor configuration
  // useMemo prevents recreating config on every render
 const config = useMemo(
  () => ({
    readonly: false,
    placeholder: 'Start writing your story...',
    height: 500,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'middle' as const, // ← explicit "as const" helps TS
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    buttons: 'bold,italic,underline,|,ul,ol,|,font,fontsize,paragraph,|,image,link,|,align,undo,redo,|,hr,table,source',
    removeButtons: ['brush', 'file'],
    disablePlugins: ['paste'],
    uploader: {
      insertImageAsBase64URI: true,
    },
    // These are the only options that still exist and are type-safe in Jodit 4+
  }),
  []
);

  // When post loads, fill the form with existing data
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCoverImage(post.coverImage || '');
      // Convert tags array to comma-separated string
      // ["react", "nextjs"] → "react, nextjs"
      setTags(post.tags?.join(', ') || '');
    }
  }, [post]); // Run when post data changes

  // Check if current user is the author
  // Only author can edit their own posts
  const isAuthor = user?.uid === post?.authorId;

  // Handle saving changes
  const handleUpdate = async (newStatus?: 'draft' | 'published') => {
    setError('');

    // Validation - make sure required fields are filled
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!content.trim()) {
      setError('Please write some content');
      return;
    }

    setLoading(true);

    try {
      // Generate excerpt (first 200 characters of plain text)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const excerpt = plainText.substring(0, 200).trim();

      // Parse tags from comma-separated string to array
      // "react, nextjs, tutorial" → ["react", "nextjs", "tutorial"]
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      // Update the post in Firestore
      await updatePost(postId, {
        title: title.trim(),
        content,
        excerpt,
        coverImage: coverImage.trim(),
        tags: tagArray,
        // If newStatus provided, update status, otherwise keep existing
        status: newStatus || post?.status,
      });

      // Navigate back to the post
      router.push(`/post/${post?.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting the post
  const handleDelete = async () => {
    // Confirm before deleting (prevent accidental deletion)
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      // Delete from Firestore
      await deletePost(postId);
      // Navigate to home page
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      setLoading(false);
    }
  };

  // Show loading spinner while fetching post
  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading post...</p>
      </div>
    );
  }

  // If post doesn't exist, show error
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Post not found</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If current user is not the author, deny access
  if (!isAuthor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">You do not have permission to edit this post</p>
          <Link href={`/post/${post.slug}`}>
            <Button>Back to Post</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main render - Edit form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with action buttons */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button */}
            <Link
              href={`/post/${post.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Cancel</span>
            </Link>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {/* Delete button */}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>

              {/* Save as draft (if currently published) */}
              {post.status === 'published' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdate('draft')}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              )}

              {/* Update button (keeps current status) */}
              <Button onClick={() => handleUpdate()} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update'}
              </Button>

              {/* Publish button (if currently draft) */}
              {post.status === 'draft' && (
                <Button onClick={() => handleUpdate('published')} disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Edit Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Title input */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter your post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-0 focus-visible:ring-0 px-0"
              disabled={loading}
            />
          </div>

          {/* Cover Image URL input */}
          <div>
            <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              disabled={loading}
            />
            {/* Preview image if URL exists */}
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover preview"
                className="mt-2 rounded-lg max-h-48 object-cover"
              />
            )}
          </div>

          {/* Tags input */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              type="text"
              placeholder="nextjs, react, tutorial"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter tags separated by commas (e.g., react, nextjs, javascript)
            </p>
          </div>

          {/* Rich Text Editor */}
          <div>
            <Label>Content</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
                onChange={(newContent) => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}