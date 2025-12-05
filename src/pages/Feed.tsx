import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import type { Post } from '@/types';
import {
  Calendar,
  FileText,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const PostCardSkeleton: React.FC = () => (
  <Card className="animate-pulse border-border/50 bg-card/50">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/6" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  currentUserId?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Check if the current user is the author of the post
  const isAuthor = currentUserId && post.author?.id && String(currentUserId) === String(post.author.id);

  // Handle backend vs frontend data structure differences
  const authorName = post.author?.name || post.author?.displayName || 'Anonymous';
  const authorAvatar = post.author?.profile?.avatar || post.author?.avatarUrl;
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Card className="border-border/50 bg-card/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-6">
        {/* Author */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-0.5 ring-2 ring-background shadow-sm">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {authorInitial}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-base hover:text-primary transition-colors cursor-pointer">
                  {authorName}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {timeAgo(post.createdAt)}
                  <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                  <span>Public</span>
                </p>
              </div>

              {/* Only show delete option if user is author */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground -mr-2">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive focus:text-destructive cursor-pointer">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            <div className="mt-3 text-sm sm:text-base leading-relaxed whitespace-pre-line text-foreground/90">
              {post.content}
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border/50">
                <img
                  src={`${api.defaults.baseURL}/${post.image}`}
                  alt="Post content"
                  className="w-full max-h-[500px] object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 group ${post.likedByUser
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
                  }`}
              >
                <div className={`p-2 rounded-full group-hover:bg-red-500/10 transition-colors ${post.likedByUser ? 'bg-red-500/10' : ''}`}>
                  <Heart className={`w-5 h-5 ${post.likedByUser ? 'fill-current' : ''}`} />
                </div>
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span>{post.comments.length}</span>
              </button>

              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group ml-auto">
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Comments */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                {post.comments.map((comment) => {
                  const commentAuthorName = comment.author?.name || comment.author?.displayName || 'Anonymous';
                  const commentAuthorInitial = commentAuthorName.charAt(0).toUpperCase();

                  return (
                    <div key={comment.id} className="flex items-start gap-3 group/comment">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 ring-2 ring-background">
                        <span className="text-xs font-bold text-muted-foreground">
                          {commentAuthorInitial}
                        </span>
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-2xl px-4 py-2 group-hover/comment:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {commentAuthorName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">{comment.content}</p>
                      </div>
                    </div>
                  )
                })}

                {/* Add Comment */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">Y</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 relative">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-muted/50 hover:bg-muted focus:bg-background border border-transparent focus:border-primary/20 rounded-full pl-4 pr-12 py-2.5 text-sm outline-none transition-all"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={!commentText.trim()}
                      className="absolute right-1 w-8 h-8 rounded-full text-primary hover:bg-primary/10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For demo purposes, we'll use a hardcoded user ID if the auth context is missing or loading
  // In a real app, we'd wait for auth
  const currentUserId = user?.id || "user_123";

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await api.getFeedPosts();
        if (response.data) {
          // Handle both array (unwrapped) and object (paginated) response structures
          const postsData = Array.isArray(response.data)
            ? response.data
            : (response.data as any).data || [];
          setPosts(postsData);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedFile) return;

    setIsPosting(true);
    try {
      const response = await api.createPost(newPostContent, {
        id: user?.id || 'user_123',
        displayName: user?.displayName || 'Anonymous',
        avatarUrl: user?.avatarUrl
      }, selectedFile);
      if (response.data) {
        setPosts([response.data, ...posts]);
        setNewPostContent('');
        removeFile();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await api.togglePostLike(postId);
      if (response.data) {
        setPosts(posts.map(post =>
          post.id === postId
            ? {
              ...post,
              likes: response.data!.length, // Backend returns array of user IDs
              likedByUser: response.data!.includes(currentUserId)
            }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      // Optimistic update
      setPosts(posts.filter(p => p.id !== postId));
      await api.deletePost(postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
      // Revert if failed (would need to re-fetch or keep previous state)
      // For now, we'll just re-fetch to be safe
      const response = await api.getFeedPosts();
      if (response.data) {
        setPosts(response.data.data || []);
      }
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen bg-background/50">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
              <TrendingUp className="w-4 h-4" />
              <span>Trending in your network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
              Your Professional <span className="gradient-text">Feed</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest insights and opportunities
            </p>
          </div>

          {/* Create Post */}
          <Card className="mb-10 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 ring-2 ring-background shadow-sm">
                  <span className="text-lg font-bold text-primary">
                    {user?.displayName?.charAt(0) || 'Y'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      placeholder="What's on your mind? Share insights, ask questions, or post updates..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full min-h-[120px] bg-muted/30 hover:bg-muted/50 focus:bg-background border-2 border-transparent focus:border-primary/10 rounded-xl p-4 resize-none outline-none text-foreground placeholder:text-muted-foreground/70 transition-all text-base"
                    />
                    <div className="absolute bottom-3 right-3">
                      <Sparkles className="w-5 h-5 text-primary/20" />
                    </div>
                  </div>

                  {/* File Preview */}
                  {selectedFile && (
                    <div className="mt-4 relative group inline-block">
                      {selectedFile.type.startsWith('image/') ? (
                        <div className="relative rounded-xl overflow-hidden border border-border/50">
                          <img
                            src={previewUrl!}
                            alt="Preview"
                            className="max-h-64 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full px-3"
                        onClick={() => triggerFileInput('image/*,video/*')}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">Media</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full px-3"
                        onClick={() => {/* TODO: Implement Event modal */ }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">Event</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full px-3"
                        onClick={() => triggerFileInput('application/pdf')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">Write Article</span>
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={(!newPostContent.trim() && !selectedFile) || isPosting}
                      className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all ml-auto"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <div className="space-y-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : (posts?.length || 0) > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDeletePost}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Your feed is empty. Be the first to share something with your network!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Load More */}
          {posts.length > 0 && (
            <div className="mt-10 text-center">
              <Button variant="secondary" className="rounded-full px-8 h-10">
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Feed;
