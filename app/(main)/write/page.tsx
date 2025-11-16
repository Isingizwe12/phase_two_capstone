'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { createPost } from '@/lib/services/postService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';

// Dynamically import Jodit to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const editor = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jodit editor config 
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Start writing your story...',
      minHeight: 400,
      toolbar: true,
      spellcheck: true,
      language: 'en',
      toolbarButtonSize: 'medium',
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      buttons: [
        'bold',
        'italic',
        'underline',
        '|',
        'ul',
        'ol',
        '|',
        'font',
        'fontsize',
        '|',
        'paragraph',
        '|',
        'image',
        'link',
        '|',
        'align',
        '|',
        'undo',
        'redo',
        '|',
        'hr',
        'table',
        'source',
      ],
      uploader: {
        insertImageAsBase64URI: true, // For now, use base64 (we'll add Cloudinary later)
      },
      removeButtons: ['brush', 'file'],
      disablePlugins: 'paste',
    }),
    []
  );

  // Redirect if not logged in - MOVED AFTER ALL HOOKS
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleSave = async (status: 'draft' | 'published') => {
    setError('');

    // Validation
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
      // Generate excerpt from content (first 200 chars of plain text)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const excerpt = plainText.substring(0, 200).trim();

      // Parse tags (comma-separated)
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      await createPost(
        {
          title: title.trim(),
          content,
          excerpt,
          coverImage: coverImage.trim(),
          tags: tagArray,
          status,
        },
        user!.uid
      );

      // Redirect based on status
      if (status === 'published') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If no user after loading, the useEffect will redirect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Title */}
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

          {/* Cover Image URL */}
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
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover preview"
                className="mt-2 rounded-lg max-h-48 object-cover"
              />
            )}
          </div>

          {/* Tags */}
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