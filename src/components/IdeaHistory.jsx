import React, { useState, useEffect } from 'react';
import { getUserIdeas } from '../firebase/db';
import { 
  ClockIcon, 
  TagIcon, 
  SparklesIcon, 
  ChevronDownIcon, 
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

const IdeaHistory = ({ userId }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIdeas, setExpandedIdeas] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setLoading(true);
        const userIdeas = await getUserIdeas(userId);
        setIdeas(userIdeas.sort((a, b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error('履歴読み込みエラー:', err);
        setError('アイデアの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [userId]);

  const allTags = [...new Set(ideas.flatMap(idea => idea.tags || []))];

  const filteredIdeas = ideas.filter(idea => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return idea.createdAt?.toDate() >= today;
    }
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return idea.createdAt?.toDate() >= weekAgo;
    }
    if (filter === 'tagged') {
      return selectedTags.every(tag => idea.tags?.includes(tag));
    }
    return true;
  });

  const toggleIdea = (ideaId) => {
    setExpandedIdeas(prev => ({
      ...prev,
      [ideaId]: !prev[ideaId]
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '日時不明';
    const date = timestamp.toDate?.() || timestamp;
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">アイデア履歴</h3>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">すべて</option>
            <option value="today">今日</option>
            <option value="week">今週</option>
            <option value="tagged">タグ付き</option>
          </select>
        </div>
      </div>

      {filter === 'tagged' && (
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
              )}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                ${selectedTags.includes(tag)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <TagIcon className="h-4 w-4 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleIdea(idea.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">
                    {idea.title || '無題のアイデア'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(idea.createdAt)}
                    </div>
                    {idea.aiAnalysis && (
                      <div className="flex items-center text-indigo-600">
                        <SparklesIcon className="h-4 w-4 mr-1" />
                        <span>AI分析あり</span>
                      </div>
                    )}
                  </div>
                </div>
                {expandedIdeas[idea.id] ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {!expandedIdeas[idea.id] && (
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {idea.content}
                </p>
              )}
            </div>

            {expandedIdeas[idea.id] && (
              <div className="border-t border-gray-200">
                <div className="p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-2">アイデアの内容:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {idea.content}
                  </p>
                </div>

                {idea.aiAnalysis && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <SparklesIcon className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-medium text-gray-700">AI分析結果:</h4>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {idea.aiAnalysis}
                      </p>
                    </div>
                  </div>
                )}

                {idea.tags && idea.tags.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredIdeas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            表示するアイデアがありません
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaHistory;