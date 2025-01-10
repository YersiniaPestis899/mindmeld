import React, { useState } from 'react';
import IdeaCanvas from '../components/IdeaCanvas';
import AIAssistant from '../components/AIAssistant';
import IdeaHistory from '../components/IdeaHistory';
import { Tab } from '@headlessui/react';
import { 
  MusicalNoteIcon, 
  ClockIcon, 
  SparklesIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MyIdeasWorkspace = ({ userId }) => {
  const [currentIdea, setCurrentIdea] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      name: 'アイデア作成',
      icon: PencilIcon,
      content: (
        <div className="space-y-6">
          <IdeaCanvas 
            userId={userId}
            onIdeaChange={setCurrentIdea}
          />
          {currentIdea && (
            <AIAssistant
              ideaContent={currentIdea}
              onExpansionGenerated={(expansion) => {
                console.log('AI Expansion:', expansion);
              }}
            />
          )}
        </div>
      )
    },
    {
      name: '履歴',
      icon: ClockIcon,
      content: <IdeaHistory userId={userId} />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-full">
            <MusicalNoteIcon className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            パーソナルワークスペース
          </h2>
        </div>
        <p className="text-gray-600 max-w-3xl">
          アイデアをAIと共に育てる、あなただけの創造空間です。
          ここでは、閃きを記録し、AIの助けを借りて発展させ、
          そして時間をかけて育てていくことができます。
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <Tab.Group onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 p-1 bg-indigo-50">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                    selected
                      ? 'bg-white text-indigo-700 shadow'
                      : 'text-gray-700 hover:bg-white/[0.5] hover:text-gray-900'
                  )
                }
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="p-6">
            {tabs.map((tab, index) => (
              <Tab.Panel
                key={index}
                className={classNames(
                  'focus:outline-none',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400'
                )}
              >
                {tab.content}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-medium text-gray-900">クイックヒント</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
            <span>アイデアは短く具体的に書くと、AIがより良い提案を行えます</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
            <span>タグを活用すると、後から関連するアイデアを見つけやすくなります</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
            <span>定期的に過去のアイデアを振り返ることで、新しい発想が生まれやすくなります</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MyIdeasWorkspace;