import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './components/Auth';
import AIAssistant from './components/AIAssistant';
import MyIdeasWorkspace from './pages/MyIdeasWorkspace';
import SharedIdeasSpace from './pages/SharedIdeasSpace';
import UserProfile from './pages/UserProfile';
import { subscribeToAuth } from './firebase/auth';
import { PlayIcon, SparklesIcon, MusicalNoteIcon, UsersIcon } from '@heroicons/react/24/solid';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiContext, setAiContext] = useState({
    summary: 'アイデアを広げるために、AIがサポートします',
    suggestions: [
      'アイデアの展開をお手伝いできます',
      '関連する情報を検索できます',
      'ブレインストーミングをサポートします'
    ]
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-500/10 to-pink-500/10">
        <div className="animate-pulse">
          <MusicalNoteIcon className="h-12 w-12 text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-indigo-500/10 to-pink-500/10">
        <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <PlayIcon className="h-8 w-8 text-indigo-500" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">
                    アイデアのアンプ
                  </h1>
                </Link>
                
                {user && (
                  <div className="flex space-x-4">
                    <Link
                      to="/my-ideas"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors"
                    >
                      <MusicalNoteIcon className="h-5 w-5" />
                      <span>マイアイデア</span>
                    </Link>
                    <Link
                      to="/shared-ideas"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors"
                    >
                      <UsersIcon className="h-5 w-5" />
                      <span>共有スペース</span>
                    </Link>
                  </div>
                )}
              </div>
              <Auth />
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/my-ideas" replace />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 opacity-75 blur"></div>
                      <div className="relative bg-white p-8 rounded-lg shadow-xl">
                        <div className="flex items-center justify-center mb-6">
                          <SparklesIcon className="h-12 w-12 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                          アイデアを増幅させよう
                        </h2>
                        <p className="text-gray-600 text-center max-w-md">
                          AIとの協調でアイデアを増幅。
                          あなたの創造性を最大限に引き出します。
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MusicalNoteIcon className="h-5 w-5" />
                        <span>アイデアを奏でる</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <SparklesIcon className="h-5 w-5" />
                        <span>AIで増幅する</span>
                      </div>
                    </div>
                  </div>
                )
              }
            />
            <Route
              path="/my-ideas"
              element={user ? <MyIdeasWorkspace userId={user.uid} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/shared-ideas"
              element={user ? <SharedIdeasSpace userId={user.uid} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/profile"
              element={user ? <UserProfile userId={user.uid} /> : <Navigate to="/" replace />}
            />
          </Routes>
        </main>

        {user && <AIAssistant context={aiContext} onToggle={(isExpanded) => {
          console.log('AI Assistant toggled:', isExpanded);
        }} />}
      </div>
    </Router>
  );
};

export default App;