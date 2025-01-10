import React, { useState } from 'react';
import { AIService } from '../services/ai';
import { SparklesIcon, MusicalNoteIcon, BeakerIcon } from '@heroicons/react/24/outline';

const aiService = new AIService();

const IdeaExpansion = ({ ideaContent, onExpansionGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateExpansion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const expansion = await aiService.generateIdeaExpansion(ideaContent);
      onExpansionGenerated(expansion);
    } catch (err) {
      setError('AIによる増幅に失敗しました。もう一度お試しください。');
      console.error('展開生成エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">AIで増幅する</span>
        </div>
        <div className="flex items-center space-x-2">
          <MusicalNoteIcon className="h-5 w-5 text-pink-500 animate-bounce" />
          <BeakerIcon className="h-5 w-5 text-cyan-500" />
        </div>
      </div>

      <button
        onClick={handleGenerateExpansion}
        disabled={loading}
        className={`w-full group relative px-4 py-2 bg-gradient-to-r from-indigo-500/90 to-pink-500/90 
          text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-y-[-1px]'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-lg opacity-0 
          group-hover:opacity-100 transition-opacity duration-200"></div>
        
        <div className="relative flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>アイデアを増幅中...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              <span>アイデアを増幅</span>
            </>
          )}
        </div>
      </button>
      
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

export default IdeaExpansion;