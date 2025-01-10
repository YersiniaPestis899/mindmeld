import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 共有アイデアの取得（一時的な実装）
export const getSharedIdeas = async () => {
  try {
    const ideasRef = collection(db, 'ideas');
    // シンプルなクエリに変更
    const publicIdeasQuery = query(
      ideasRef,
      where('visibility', '==', 'public')
    );
    
    const querySnapshot = await getDocs(publicIdeasQuery);
    
    // クライアントサイドでソート
    const ideas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return ideas.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching shared ideas:', error);
    throw new Error('共有アイデアの取得に失敗しました。ネットワーク接続を確認してください。');
  }
};

// アイデアの作成
export const createIdea = async (ideaData) => {
  try {
    const ideasRef = collection(db, 'ideas');
    const docRef = await addDoc(ideasRef, {
      ...ideaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      visibility: ideaData.visibility || 'private',
      collaborators: ideaData.collaborators || []
    });
    
    return {
      id: docRef.id,
      ...ideaData
    };
  } catch (error) {
    console.error('Error creating idea:', error);
    throw new Error('アイデアの作成に失敗しました。');
  }
};

// アイデアの更新
export const updateIdea = async (ideaId, updateData) => {
  try {
    const ideaRef = doc(db, 'ideas', ideaId);
    await updateDoc(ideaRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: ideaId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating idea:', error);
    throw new Error('アイデアの更新に失敗しました。');
  }
};

// コラボレーターの追加
export const addCollaborator = async (ideaId, userId) => {
  try {
    const ideaRef = doc(db, 'ideas', ideaId);
    await updateDoc(ideaRef, {
      collaborators: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding collaborator:', error);
    throw new Error('コラボレーターの追加に失敗しました。');
  }
};