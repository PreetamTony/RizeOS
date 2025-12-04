import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types';
import api from '@/services/api';

const PostCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
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
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
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

  return (
    <Card>
      <CardContent className="p-6">
        {/* Author */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {post.author?.avatarUrl ? (
              <img 
                src={post.author.avatarUrl} 
                alt={post.author.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary">
                {post.author?.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{post.author?.displayName || 'Anonymous'}</h4>
                <p className="text-sm text-muted-foreground">{timeAgo(post.createdAt)}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <p className="mt-4 whitespace-pre-line">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  post.likedByUser 
                    ? 'text-destructive' 
                    : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.likedByUser ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
              
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Comments */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium">
                        {comment.author?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {comment.author?.displayName || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">Y</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button size="icon" variant="ghost" disabled={!commentText.trim()}>
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

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await api.getFeedPosts();
        if (response.data) {
          setPosts(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setIsPosting(true);
    try {
      const response = await api.createPost(newPostContent);
      if (response.data) {
        setPosts([response.data, ...posts]);
        setNewPostContent('');
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
            ? { ...post, likes: response.data!.likes, likedByUser: response.data!.liked }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">
            Your <span className="gradient-text">Feed</span>
          </h1>
          <p className="text-muted-foreground">
            Stay connected with your professional network
          </p>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {user?.displayName?.charAt(0) || 'Y'}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Share something with your network..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full min-h-[100px] bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() || isPosting}
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      'Post'
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
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share something with your network!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Load More */}
        {posts.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Feed;
