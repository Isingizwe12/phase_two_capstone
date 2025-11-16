import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPublishedPosts,
  getPostById,
  getPostBySlug,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
} from '@/lib/services/postService';
import { Post, CreatePostInput, UpdatePostInput } from '@/types';

// Get all published posts
export function usePublishedPosts(limit?: number) {
  return useQuery({
    queryKey: ['posts', 'published', limit],
    queryFn: () => getPublishedPosts(limit),
  });
}

// Get single post by ID
export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
}

// Get single post by slug
export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ['posts', 'slug', slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  });
}

// Get posts by author
export function useAuthorPosts(authorId: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['posts', 'author', authorId, includeDrafts],
    queryFn: () => getPostsByAuthor(authorId, includeDrafts),
    enabled: !!authorId,
  });
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, authorId }: { data: CreatePostInput; authorId: string }) =>
      createPost(data, authorId),
    onSuccess: () => {
      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Update post mutation
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: Partial<UpdatePostInput> }) =>
      updatePost(postId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific post and posts list
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'published'] });
    },
  });
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      // Invalidate posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}