import React, { useState, useCallback, useEffect } from 'react';
import { auth } from '../firebase/config';
import { createIdea } from '../firebase/db';
import { SparklesIcon, DocumentIcon, TagIcon, ShareIcon, MusicalNoteIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import AIAssistant from './AIAssistant';

const ShareForm = ({ onIdeaCreated }) => {
  // Form State Management
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    visibility: 'private'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // AI Assistant Integration
  const [activeContent, setActiveContent] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(true);

  // ユーザー情報の取得
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Content Change Monitoring
  useEffect(() => {
    const combinedContent = `タイトル: ${formData.title}\n\n内容:\n${formData.content}`;
    setActiveContent(combinedContent);
  }, [formData.title, formData.content]);

  // Form Reset Handler
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      visibility: 'private'
    });
    setTagInput('');
    setError(null);
    setActiveContent('');
  }, []);

  // Tag Management
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    if (!formData.content.trim()) {
      setError('内容を入力してください');
      return;
    }

    try {
      setLoading(true);
      const newIdea = await createIdea(currentUser.uid, {
        ...formData,
        author: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '匿名ユーザー',
          email: currentUser.email,
          photoURL: currentUser.photoURL
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSuccess(true);
      resetForm();
      if (onIdeaCreated) {
        onIdeaCreated(newIdea);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('保存エラー:', err);
      setError('アイデアの保存に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-500 rounded-full p-2">
              <MusicalNoteIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">新しいアイデアを奏でる</h2>
          </div>
          
          {/* ユーザー情報表示 */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-700">
                  {currentUser.displayName || 'ユーザー'}
                </p>
                <p className="text-gray-500 text-xs">{currentUser.email}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-md border-gray-300 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="アイデアのタイトルを入力..."
              />
              <DocumentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows="4"
                className="w-full rounded-md border-gray-300 pl-10 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="アイデアの詳細を記述..."
              />
              <SparklesIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              タグ
            </label>
            <div className="relative">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                className="w-full rounded-md border-gray-300 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter キーでタグを追加..."
              />
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-indigo-200 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公開設定
            </label>
            <div className="relative">
              <select
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                className="w-full rounded-md border-gray-300 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="private">非公開（自分のみ）</option>
                <option value="public">公開（すべてのユーザー）</option>
                <option value="shared">特定ユーザーと共有</option>
              </select>
              <ShareIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {formData.visibility === 'public' && '公開設定の場合、あなたの名前とプロフィール画像が表示されます'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent
              rounded-md shadow-sm text-sm font-medium text-white 
              ${loading || success 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
              transition-all duration-300`}
          >
            <div className="flex items-center space-x-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>保存中...</span>
                </>
              ) : success ? (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>保存完了!</span>
                </>
              ) : (
                <>
                  <MusicalNoteIcon className="h-5 w-5" />
                  <span>アイデアを奏でる</span>
                </>
              )}
            </div>
          </button>

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
        </form>
      </div>

      {/* AI Assistant Integration */}
      {showAIAssistant && (
        <AIAssistant
          context={{
            summary: 'アイデア入力支援',
            suggestions: ['入力内容に基づく提案を表示します']
          }}
          activeText={activeContent}
          onToggle={(isExpanded) => console.log('AI Assistant toggled:', isExpanded)}
        />
      )}
    </div>
  );
};

export default ShareForm;