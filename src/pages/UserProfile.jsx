import React from 'react';
import { auth } from '../firebase/config';
import { UserIcon } from '@heroicons/react/24/outline';

const UserProfile = ({ userId }) => {
  const user = auth.currentUser;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
        <div className="flex items-center space-x-4 mb-6">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-indigo-500" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.displayName || 'ユーザー'}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">アカウント情報</h3>
            <p className="mt-1 text-sm text-gray-600">
              あなたのアカウントの基本情報です。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                名前
              </label>
              <p className="mt-1 p-2 bg-gray-50 rounded-md">
                {user?.displayName || '未設定'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <p className="mt-1 p-2 bg-gray-50 rounded-md">
                {user?.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                アカウント作成日
              </label>
              <p className="mt-1 p-2 bg-gray-50 rounded-md">
                {user?.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('ja-JP')
                  : '不明'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;