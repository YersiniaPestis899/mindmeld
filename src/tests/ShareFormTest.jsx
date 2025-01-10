import React, { useState } from 'react';
import ShareForm from '../components/ShareForm';
import { auth } from '../firebase/config';
import { createIdea, getUserIdeas } from '../firebase/db';

const ShareFormTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    console.log('🔍 テスト実行開始...');
    
    // テストケース1: 基本データ保存
    const testCase1 = async () => {
      console.log('📋 テストケース1: 基本データ保存');
      try {
        const testData = {
          title: 'テストアイデア',
          content: 'これはテストコンテンツです。',
          tags: [],
          visibility: 'private'
        };
        const savedIdea = await createIdea(auth.currentUser.uid, testData);
        console.log('✅ 基本データ保存成功:', savedIdea);
        setTestResults(prev => [...prev, { name: '基本データ保存', status: 'success' }]);
        return true;
      } catch (error) {
        console.error('❌ 基本データ保存失敗:', error);
        setTestResults(prev => [...prev, { name: '基本データ保存', status: 'error', message: error.message }]);
        return false;
      }
    };

    // テストケース2: タグ付きデータ保存
    const testCase2 = async () => {
      console.log('📋 テストケース2: タグ付きデータ保存');
      try {
        const testData = {
          title: 'タグ付きテスト',
          content: 'タグのテストです。',
          tags: ['テスト', 'サンプル', 'AI'],
          visibility: 'private'
        };
        const savedIdea = await createIdea(auth.currentUser.uid, testData);
        console.log('✅ タグ付きデータ保存成功:', savedIdea);
        setTestResults(prev => [...prev, { name: 'タグ付きデータ保存', status: 'success' }]);
        return true;
      } catch (error) {
        console.error('❌ タグ付きデータ保存失敗:', error);
        setTestResults(prev => [...prev, { name: 'タグ付きデータ保存', status: 'error', message: error.message }]);
        return false;
      }
    };

    // テストケース3: 公開設定付きデータ保存
    const testCase3 = async () => {
      console.log('📋 テストケース3: 公開設定テスト');
      try {
        const testData = {
          title: '公開テスト',
          content: '公開設定のテストです。',
          tags: ['公開'],
          visibility: 'public'
        };
        const savedIdea = await createIdea(auth.currentUser.uid, testData);
        console.log('✅ 公開設定データ保存成功:', savedIdea);
        setTestResults(prev => [...prev, { name: '公開設定データ保存', status: 'success' }]);
        return true;
      } catch (error) {
        console.error('❌ 公開設定データ保存失敗:', error);
        setTestResults(prev => [...prev, { name: '公開設定データ保存', status: 'error', message: error.message }]);
        return false;
      }
    };

    // テストケース4: データ取得テスト
    const testCase4 = async () => {
      console.log('📋 テストケース4: データ取得テスト');
      try {
        const ideas = await getUserIdeas(auth.currentUser.uid);
        console.log('✅ データ取得成功:', ideas);
        setTestResults(prev => [...prev, { name: 'データ取得', status: 'success', data: ideas.length }]);
        return true;
      } catch (error) {
        console.error('❌ データ取得失敗:', error);
        setTestResults(prev => [...prev, { name: 'データ取得', status: 'error', message: error.message }]);
        return false;
      }
    };

    // テストの実行
    await Promise.all([
      testCase1(),
      testCase2(),
      testCase3(),
      testCase4()
    ]);

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">ShareForm データベース連携テスト</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className={`px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 
          disabled:opacity-50 disabled:cursor-not-allowed mb-4`}
      >
        {loading ? 'テスト実行中...' : 'テスト実行'}
      </button>

      {testResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                result.status === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{result.name}</span>
                  <span className="text-sm">
                    {result.status === 'success' 
                      ? '✅ 成功' 
                      : `❌ 失敗: ${result.message}`
                    }
                  </span>
                </div>
                {result.data && (
                  <span className="text-sm">
                    データ数: {result.data}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareFormTest;