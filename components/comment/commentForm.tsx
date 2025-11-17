// components/comment/CommentForm.tsx
'use client';

// React hooks
import { useState } from 'react';

// Auth context
import { useAuth } from '@/lib/context/AuthContext';

// Comment service
import { createComment } from '@/lib/services/commentService';

// UI components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Icons
import { Send } from 'lucide-react';

// Next.js Link
import Link from 'next/link';

/**
 * Props for CommentForm component
 */
interface CommentFormProps {
  postId: string;              // Which post to comment on
  onCommentAdded: () => void;  // Callback after comment is added
}

/**
 * CommentForm Component
 * Form to add a new comment
 */
export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  // Get current logged-in user
  const { user } = useAuth();

  // Component state
  const [content, setContent] = useState('');     // Comment text
  const [loading, setLoading] = useState(false);  // Submitting state
  const [error, setError] = useState('');         // Error message

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission (page refresh)
    e.preventDefault();

    // Reset error
    setError('');

    // Validation - make sure comment is not empty
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    // User must be logged in to comment
    if (!user) {
      setError('Please login to comment');
      return;
    }

    setLoading(true);

    try {
      // Create comment in Firestore
      await createComment(
        {
          postId,                  // Which post
          content: content.trim(), // Comment text (trimmed)
        },
        user.uid                   // Who is commenting
      );

      // Clear the form
      setContent('');

      // Trigger callback to refresh comments list
      onCommentAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">Please login to leave a comment</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  // Render comment form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Comment textarea */}
      <div>
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={4}
          className="resize-none"
        />
        {/* Character counter */}
        <p className="text-sm text-gray-500 mt-1">
          {content.length} / 500 characters
        </p>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !content.trim()}>
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}