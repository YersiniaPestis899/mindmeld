import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  UsersIcon, 
  PlusIcon, 
  BookOpenIcon,
  ChatBubbleLeftEllipsisIcon,
  SparklesIcon,
  MusicalNoteIcon 
} from '@heroicons/react/24/outline';
import ShareForm from '../components/ShareForm';
import SharedIdeasList from '../components/SharedIdeasList';
import CollaborationPanel from '../components/CollaborationPanel';
import { getSharedIdeas } from '../services/ideaService';
import { RealtimeDbService } from '../services/realtimeDb';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SharedIdeasSpace = ({ userId }) => {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [collaborators, setCollaborators] = useState({});
  const [activeIndicator, setActiveIndicator] = useState(0);

  // イコライザーアニメーションの自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndicator(prev => (prev + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSharedIdeas = async () => {
      try {
        setLoading(true);
        setError(null);
        const sharedIdeas = await getSharedIdeas();
        setIdeas(sharedIdeas);
      } catch (err) {
        console.error('Shared ideas loading error:', err);
        setError('アイデアの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadSharedIdeas();
  }, [userId]);

  useEffect(() => {
    if (!selectedIdea) return;

    const unsubscribe = RealtimeDbService.subscribeToPresence(selectedIdea.id, (presence) => {
      setCollaborators(presence);
    });

    RealtimeDbService.updateUserPresence(userId, selectedIdea.id, 'active');

    return () => {
      unsubscribe();
      if (selectedIdea) {
        RealtimeDbService.updateUserPresence(userId, selectedIdea.id, 'inactive');
      }
    };
  }, [selectedIdea, userId]);

  const handleIdeaSelect = (idea) => {
    setSelectedIdea(idea);
    setActiveTab(2); // Switch to collaboration tab
  };

  const tabs = [
    {
      name: '共有アイデア',
      icon: BookOpenIcon,
      content: (
        <SharedIdeasList 
          ideas={ideas}
          loading={loading}
          error={error}
          onIdeaSelect={handleIdeaSelect}
          collaborators={collaborators}
        />
      )
    },
    {
      name: '新規作成',
      icon: PlusIcon,
      content: (
        <ShareForm 
          userId={userId}
          onIdeaCreated={(newIdea) => {
            setIdeas(prev => [newIdea, ...prev]);
            setActiveTab(0);
          }}
        />
      )
    },
    {
      name: 'コラボレーション',
      icon: ChatBubbleLeftEllipsisIcon,
      content: (
        <CollaborationPanel 
          userId={userId}
          selectedIdea={selectedIdea}
          collaborators={collaborators}
        />
      )
    }
  ];

  // アニメーション付きタブインジケーター
  const AnimatedTabIndicator = ({ isActive }) => (
    <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
      <div className="flex space-x-1 justify-center">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isActive ? 'bg-indigo-500' : 'bg-indigo-200'
            } transform ${
              i === activeIndicator && isActive ? 'scale-125' : 'scale-100'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl p-6 shadow-lg border border-indigo-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            アイデア共有スペース
          </h2>
        </div>
        <p className="text-gray-600 max-w-3xl">
          ここはアイデアを共有し、他のユーザーとコラボレーションを行う空間です。
          フィードバックを通じて、アイデアをより良いものへと発展させましょう。
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 p-1 bg-indigo-50">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) => classNames(
                  'relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  'focus:outline-none',
                  selected
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-700 hover:bg-white/[0.5] hover:text-gray-900'
                )}
              >
                {({ selected }) => (
                  <>
                    <tab.icon className={`h-5 w-5 transition-colors duration-300 ${
                      selected ? 'text-indigo-500' : 'text-gray-400'
                    }`} />
                    <span>{tab.name}</span>
                    <AnimatedTabIndicator isActive={selected} />
                  </>
                )}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="p-6">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames(
                  'focus:outline-none transition-opacity duration-300',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400'
                )}
              >
                {tab.content}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl p-6 shadow-lg border border-indigo-100">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            コラボレーションのヒント
          </h3>
        </div>
        <ul className="space-y-3">
          {[
            '建設的なフィードバックを心がけましょう',
            'アイデアに関連する経験や知見を共有することで、議論が深まります',
            '定期的に進捗を更新し、コラボレーターと方向性を確認しましょう'
          ].map((tip, index) => (
            <li key={index} className="flex items-center space-x-2 text-gray-600">
              <MusicalNoteIcon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SharedIdeasSpace;