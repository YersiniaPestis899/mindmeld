import { 
  collection, 
  doc, 
  setDoc,
  addDoc,
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// アイデアの作成
export const createIdea = async (userId, ideaData) => {
  try {
    if (!userId) throw new Error('ユーザーIDが必要です');
    if (!ideaData.title) throw new Error('タイトルが必要です');
    if (!ideaData.content) throw new Error('内容が必要です');

    const ideaRef = collection(db, 'ideas');
    const timestamp = serverTimestamp();

    const newIdea = {
      title: ideaData.title,
      content: ideaData.content,
      creatorId: userId,
      visibility: ideaData.visibility || 'private',
      collaborators: ideaData.collaborators || [],
      createdAt: timestamp,
      updatedAt: timestamp,
      tags: ideaData.tags || [],
      status: 'active',
      aiAnalysis: ideaData.aiAnalysis || null,
      aiAnalysisTimestamp: ideaData.aiAnalysis ? timestamp : null
    };

    const docRef = await addDoc(ideaRef, newIdea);
    console.log('Document written with ID:', docRef.id);

    return {
      id: docRef.id,
      ...newIdea
    };
  } catch (error) {
    console.error('Error creating idea:', error);
    throw new Error(`アイデアの作成に失敗しました: ${error.message}`);
  }
};

// ユーザーのアイデア一覧取得（インデックス対応版）
export const getUserIdeas = async (userId) => {
  try {
    if (!userId) throw new Error('ユーザーIDが必要です');

    const ideasRef = collection(db, 'ideas');
    
    // 基本的なクエリ制約
    let queryConstraints = [
      where('creatorId', '==', userId),
      where('status', '==', 'active')
    ];

    // クエリの作成と実行
    const baseQuery = query(ideasRef, ...queryConstraints);
    const querySnapshot = await getDocs(baseQuery);
    
    if (querySnapshot.empty) {
      return [];
    }

    // メモリ内でのソート処理
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // createdAtによるソート
    results.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
      const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
      return dateB - dateA; // 降順ソート
    });

    return results;
  } catch (error) {
    console.error('Error fetching user ideas:', error);
    throw new Error(`アイデア一覧の取得に失敗しました: ${error.message}`);
  }
};

// アイデアの取得
export const getIdea = async (ideaId) => {
  try {
    if (!ideaId) throw new Error('アイデアIDが必要です');

    const ideaRef = doc(db, 'ideas', ideaId);
    const ideaSnap = await getDoc(ideaRef);
    
    if (!ideaSnap.exists()) {
      throw new Error('アイデアが見つかりません');
    }

    const data = ideaSnap.data();
    return {
      id: ideaSnap.id,
      ...data
    };
  } catch (error) {
    console.error('Error fetching idea:', error);
    throw new Error(`アイデアの取得に失敗しました: ${error.message}`);
  }
};

// アイデアの更新
export const updateIdea = async (ideaId, updateData) => {
  try {
    if (!ideaId) throw new Error('アイデアIDが必要です');

    const ideaRef = doc(db, 'ideas', ideaId);
    const timestamp = serverTimestamp();

    const updatePayload = {
      ...updateData,
      updatedAt: timestamp
    };

    await setDoc(ideaRef, updatePayload, { merge: true });

    return {
      id: ideaId,
      ...updatePayload
    };
  } catch (error) {
    console.error('Error updating idea:', error);
    throw new Error(`アイデアの更新に失敗しました: ${error.message}`);
  }
};

// アイデアの論理削除
export const deleteIdea = async (ideaId) => {
  try {
    if (!ideaId) throw new Error('アイデアIDが必要です');

    const ideaRef = doc(db, 'ideas', ideaId);
    await setDoc(ideaRef, {
      status: 'deleted',
      updatedAt: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw new Error(`アイデアの削除に失敗しました: ${error.message}`);
  }
};