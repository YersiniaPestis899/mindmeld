import React, { useState, useCallback } from 'react';
import { auth } from '../firebase/config';
import { createIdea } from '../firebase/db';
import { 
  SparklesIcon, 
  ClipboardDocumentIcon,
  MusicalNoteIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { AIService } from '../services/ai';

const IdeaCanvas = () => {
  const [newIdea, setNewIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [isAmplifying, setIsAmplifying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [aiService] = useState(() => new AIService());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIdea.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const ideaData = {
        title: 'New Idea',
        content: newIdea,
        creatorId: auth.currentUser?.uid,
        visibility: 'private',
        aiAnalysis: aiResponse
      };

      const savedIdea = await createIdea(auth.currentUser?.uid, ideaData);
      console.log('Idea saved successfully:', savedIdea);

      setNewIdea('');
      setAiResponse(null);
      setCopySuccess(false);
    } catch (err) {
      console.error('保存エラー:', err);
      setError('アイデアの保存に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleAmplify = async () => {
    if (!newIdea.trim()) return;
    
    try {
      setIsAmplifying(true);
      setError(null);
      setCopySuccess(false);

      const response = await aiService.generateIdeaExpansion(newIdea);
      setAiResponse(response);

    } catch (err) {
      console.error('AI処理エラー:', err);
      setError('AIによる分析に失敗しました。再試行してください。');
    } finally {
      setIsAmplifying(false);
    }
  };

  const handleCopy = async () => {
    if (!aiResponse) return;

    try {
      await navigator.clipboard.writeText(aiResponse);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('コピーエラー:', err);
      setError('テキストのコピーに失敗しました。');
    }
  };

  // 音符アニメーションのコンポーネント
  const AnimatedNotes = () => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <MusicalNoteIcon
            key={i}
            className={`h-6 w-6 text-white animate-bounce`}
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl p-6 shadow-lg border border-indigo-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-full">
            <MusicalNoteIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            アイデアアンプ
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="relative">
              <textarea
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="アイデアを入力してアンプで増幅..."
                rows="4"
                className="w-full rounded-xl border-indigo-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                  bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
              <div className="absolute top-2 left-2">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-8 bg-indigo-500/20 rounded-full transform origin-bottom 
                        ${newIdea ? 'animate-eq' : ''}`}
                      style={{
                        animationDelay: `${i * 200}ms`,
                        height: `${(i + 1) * 12}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {newIdea.trim() && (
              <button
                type="button"
                onClick={handleAmplify}
                disabled={isAmplifying}
                className={`absolute bottom-3 right-3 inline-flex items-center px-4 py-2 
                  ${isAmplifying ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} 
                  text-white text-sm font-medium rounded-full hover:shadow-lg 
                  disabled:opacity-50 transition-all duration-300 transform hover:scale-105
                  hover:from-indigo-600 hover:to-purple-600`}
              >
                <div className="relative">
                  {isAmplifying ? (
                    <AnimatedNotes />
                  ) : (
                    <SparklesIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="ml-2">
                  {isAmplifying ? 'アンプ増幅中...' : 'AIアンプにかける'}
                </span>
              </button>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={loading || !newIdea.trim()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium 
                rounded-full hover:shadow-lg disabled:opacity-50 transition-all duration-300 transform 
                hover:scale-105 hover:from-indigo-600 hover:to-purple-600 flex items-center space-x-2"
            >
              <MusicalNoteIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? '保存中...' : 'アイデアを記録'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm">
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

      {aiResponse && (
        <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl p-6 shadow-lg border border-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500 rounded-full">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                アンプ出力
              </h3>
            </div>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 transform hover:scale-105
                ${copySuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white'}
                shadow-sm hover:shadow-md border border-gray-200`}
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-1.5" />
              {copySuccess ? 'コピーしました！' : '全体をコピー'}
            </button>
          </div>
          
          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-indigo-100">
            <div className="absolute top-2 left-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-indigo-500/20 rounded-full animate-eq"
                    style={{
                      animationDelay: `${i * 200}ms`,
                      height: `${(i + 1) * 8}px`
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap pt-6">{aiResponse}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaCanvas;