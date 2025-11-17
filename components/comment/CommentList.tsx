// components/comment/CommentList.tsx
'use client';

// React hooks
import { useState, useEffect } from 'react';

// Auth context to get current user
import { useAuth } from '@/lib/context/AuthContext';

// Comment service functions
import { getCommentsByPost, deleteComment, getUserData } from '@/lib/services/commentService';

// TypeScript types
import { Comment } from '@/types';

// UI components
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

// Icons
import { Trash2, Loader2 } from 'lucide-react';

// Date formatting
import { formatDistanceToNow } from 'date-fns';

/**
 * Props for CommentList component
 */
interface CommentListProps {
  postId: string;        // Which post's comments to display
  onCommentAdded: () => void; // Callback to refresh after new comment
}

/**
 * Extended Comment with author data
 */
interface CommentWithAuthor extends Comment {
  authorName?: string;
  authorPhoto?: string;
}

/**
 * CommentList Component
 * Displays all comments for a post
 */
export default function CommentList({ postId, onCommentAdded }: CommentListProps) {
  // Get current logged-in user
  const { user } = useAuth();

  // Component state
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Fetch comments from Firestore
   * Also fetches author data for each comment
   */
  const fetchComments = async () => {
    try {
      setLoading(true);

      // Get all comments for this post
      const fetchedComments = await getCommentsByPost(postId);

      // For each comment, fetch the author's user data
      const commentsWithAuthors = await Promise.all(
        fetchedComments.map(async (comment) => {
          // Get user data from 'users' collection
          const authorData = await getUserData(comment.authorId);

          return {
            ...comment,
            authorName: authorData?.displayName || 'Anonymous',
            authorPhoto: authorData?.photoURL || '',
          };
        })
      );

      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load comments when component mounts
   * or when onCommentAdded callback is triggered
   */
  useEffect(() => {
    fetchComments();
  }, [postId, onCommentAdded]);

  /**
   * Handle deleting a comment
   * Only the comment author can delete their own comments
   */
  const handleDelete = async (commentId: string) => {
    // Confirm before deleting
    if (!confirm('Delete this comment?')) {
      return;
    }

    try {
      setDeletingId(commentId);
      
      // Delete from Firestore
      await deleteComment(commentId, postId);
      
      // Refresh the comments list
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Format comment date
   * Example: "2 hours ago", "3 days ago"
   */
  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show message if no comments yet
  if (comments.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  // Render comments list
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <Avatar className="w-10 h-10">
              {comment.authorPhoto ? (
                <img src={comment.authorPhoto} alt={comment.authorName} />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {comment.authorName?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </Avatar>

            {/* Comment Content */}
            <div className="flex-1">
              {/* Author name and date */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {comment.authorName}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Comment text */}
              <p className="text-gray-700">{comment.content}</p>
            </div>

            {/* Delete button (only for comment author) */}
            {user && user.uid === comment.authorId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {deletingId === comment.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}