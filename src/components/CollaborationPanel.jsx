import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon,
  PaperClipIcon,
  UserPlusIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { RealtimeDbService } from '../services/realtimeDb';
import AIAssistant from './AIAssistant';

const CollaborationPanel = ({ userId, selectedIdea, collaborators }) => {
  // State Management
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Comments Subscription
  useEffect(() => {
    if (!selectedIdea) return;

    const unsubscribe = RealtimeDbService.subscribeToComments(selectedIdea.id, (newComments) => {
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [selectedIdea]);

  // Comment Submission Handler
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedIdea) return;

    try {
      setLoading(true);
      setError(null);
      
      await RealtimeDbService.addComment(selectedIdea.id, userId, comment.trim());
      setComment('');
    } catch (err) {
      setError('コメントの投稿に失敗しました');
      console.error('Comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Invitation Handler
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedIdea) return;

    try {
      setLoading(true);
      setError(null);
      
      await RealtimeDbService.sendCollaborationInvite(selectedIdea.id, inviteEmail.trim());
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (err) {
      setError('招待の送信に失敗しました');
      console.error('Invitation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Empty State
  if (!selectedIdea) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <UserCircleIcon className="h-12 w-12 mb-4" />
        <p>コラボレーションするアイデアを選択してください</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* AI Assistant Integration */}
      <AIAssistant
        context={{
          summary: 'コラボレーション支援',
          suggestions: ['コメントの提案を表示します']
        }}
        activeText={comment}
        showInMyIdeas={true}
      />

      {/* Selected Idea Preview */}
      <div className="bg-indigo-50 rounded-lg p-4">
        <h3 className="font-medium text-indigo-900 mb-2">
          {selectedIdea.title}
        </h3>
        <p className="text-indigo-700 text-sm">
          {selectedIdea.content}
        </p>
      </div>

      {/* Active Collaborators */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            アクティブな参加者
          </h3>
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span className="text-sm">招待</span>
          </button>
        </div>
        
        {/* Collaborators List */}
        <div className="flex flex-wrap gap-2">
          {collaborators && Object.entries(collaborators).map(([uid, data]) => (
            <div
              key={uid}
              className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full border border-gray-200"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserCircleIcon className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-700">
                {data.displayName || 'ユーザー'}
              </span>
            </div>
          ))}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <form onSubmit={handleInvite} className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                className="flex-1 rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                招待を送信
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          ディスカッション
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力..."
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="inline-flex items-center text-gray-500 hover:text-gray-600"
            >
              <PaperClipIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">添付</span>
            </button>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '送信中...' : 'コメントを送信'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex space-x-3 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {comment.userName || 'ユーザー'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <ChatBubbleLeftEllipsisIcon className="h-8 w-8 mx-auto mb-2" />
              <p>まだコメントはありません</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center space-x-2 text-red-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;