import React, { useState, useEffect, useCallback } from 'react';
import { ChatBubbleLeftIcon as MessageSquare, XMarkIcon as X, MinusCircleIcon as MinusCircle, SparklesIcon } from '@heroicons/react/24/outline';
import { AIService } from '../services/ai';
import _ from 'lodash';

const AIAssistant = ({ context, onToggle, activeText, showInMyIdeas = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiService] = useState(() => new AIService());

  // デバウンス化された分析関数
  const debouncedAnalyze = useCallback(
    _.debounce(async (text) => {
      if (!text || text.length < 5) {
        setAiResponse(null);
        return;
      }

      try {
        setIsProcessing(true);
        const suggestions = await aiService.generateCreativeSuggestions(text);
        setAiResponse(suggestions);
      } catch (error) {
        console.error('Analysis error:', error);
        setAiResponse('分析中にエラーが発生しました。');
      } finally {
        setIsProcessing(false);
      }
    }, 500),
    [aiService]
  );

  // アクティブテキストの変更監視
  useEffect(() => {
    if (isExpanded && activeText) {
      debouncedAnalyze(activeText);
    }

    return () => {
      debouncedAnalyze.cancel();
    };
  }, [activeText, isExpanded, debouncedAnalyze]);

  // マイアイデア画面では非表示
  if (showInMyIdeas === false) {
    return null;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onToggle) onToggle(!isExpanded);
  };

  return (
    <div className="fixed top-24 right-0 z-50">
      {!isExpanded && (
        <div className="group relative">
          <button
            onClick={toggleExpand}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-l-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              AI支援
            </span>
          </button>
          
          <div className="absolute right-full top-0 mr-2 w-64 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="p-3">
              <h4 className="font-semibold text-sm text-gray-700">現在のコンテキスト:</h4>
              <p className="text-sm text-gray-600 mt-1">{context?.summary || 'アクティブなワークスペース'}</p>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="bg-white w-96 shadow-xl rounded-lg border border-gray-200 max-h-[calc(100vh-8rem)] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="font-semibold text-gray-800">AI アシスタント</h3>
            <button
              onClick={toggleExpand}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="閉じる"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto">
            <div className="space-y-4">
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2 text-indigo-600">
                  <SparklesIcon className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">アイデアを分析中...</span>
                </div>
              ) : activeText ? (
                <div className="space-y-4">
                  {aiResponse ? (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">さらに入力を続けてください...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">
                    テキストを入力すると、リアルタイムで分析とフィードバックを提供します。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;