import React from 'react';
import { 
  ChatBubbleLeftEllipsisIcon, 
  UserCircleIcon,
  TagIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const SharedIdeasList = ({ ideas, loading, error, onIdeaSelect }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '日時不明';
    // Firebaseのタイムスタンプオブジェクトかどうかを確認
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    // 通常のDateオブジェクトまたはタイムスタンプの場合
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
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
    );
  }

  if (!ideas || ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">アイデアがありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          新しいアイデアを共有してみましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          onClick={() => onIdeaSelect(idea)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-200 
                    transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">
                {idea.title}
              </h3>
              <p className="text-gray-600">{idea.content}</p>
            </div>
            {idea.visibility && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                idea.visibility === 'public' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {idea.visibility === 'public' ? '公開' : '限定共有'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <UserCircleIcon className="h-5 w-5" />
                <span className="text-sm">{idea.creatorName || '匿名'}</span>
              </div>
              {idea.createdAt && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <ClockIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
              )}
            </div>

            {idea.tags && idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                              font-medium bg-indigo-100 text-indigo-800"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharedIdeasList;