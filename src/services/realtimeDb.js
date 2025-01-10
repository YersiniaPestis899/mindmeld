import { 
  ref, 
  set, 
  push, 
  onValue, 
  off,
  update,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { rtdb } from '../firebase/config';

export class RealtimeDbService {
  // コラボレーションセッション管理
  static createCollaborationSession = async (ideaId, initialData) => {
    try {
      const sessionRef = push(ref(rtdb, `collaborations/${ideaId}`));
      await set(sessionRef, {
        ...initialData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return sessionRef.key;
    } catch (error) {
      console.error('セッション作成エラー:', error);
      throw error;
    }
  };

  // リアルタイムアップデートの監視
  static subscribeToSession = (ideaId, onUpdate) => {
    const sessionRef = ref(rtdb, `collaborations/${ideaId}`);
    onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onUpdate(data);
      }
    });

    // クリーンアップ関数を返す
    return () => off(sessionRef);
  };

  // コメント管理
  static async addComment(ideaId, userId, content) {
    try {
      const commentRef = push(ref(rtdb, `comments/${ideaId}`));
      await set(commentRef, {
        userId,
        content,
        createdAt: new Date().toISOString()
      });
      return commentRef.key;
    } catch (error) {
      console.error('コメント追加エラー:', error);
      throw error;
    }
  }

  static subscribeToComments(ideaId, onUpdate) {
    const commentsRef = ref(rtdb, `comments/${ideaId}`);
    onValue(commentsRef, (snapshot) => {
      const comments = [];
      snapshot.forEach((childSnapshot) => {
        comments.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      onUpdate(comments);
    });

    return () => off(commentsRef);
  }

  // ユーザープレゼンス管理
  static updateUserPresence(userId, ideaId, status) {
    const presenceRef = ref(rtdb, `presence/${ideaId}/${userId}`);
    return set(presenceRef, {
      status,
      lastSeen: new Date().toISOString()
    });
  }

  static subscribeToPresence(ideaId, onUpdate) {
    const presenceRef = ref(rtdb, `presence/${ideaId}`);
    onValue(presenceRef, (snapshot) => {
      const presence = snapshot.val() || {};
      onUpdate(presence);
    });

    return () => off(presenceRef);
  }

  // 変更履歴管理
  static async addChangeHistory(ideaId, userId, change) {
    try {
      const historyRef = push(ref(rtdb, `history/${ideaId}`));
      await set(historyRef, {
        userId,
        change,
        timestamp: new Date().toISOString()
      });
      return historyRef.key;
    } catch (error) {
      console.error('履歴追加エラー:', error);
      throw error;
    }
  }

  static subscribeToHistory(ideaId, onUpdate) {
    const historyRef = ref(rtdb, `history/${ideaId}`);
    onValue(historyRef, (snapshot) => {
      const history = [];
      snapshot.forEach((childSnapshot) => {
        history.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      onUpdate(history.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ));
    });

    return () => off(historyRef);
  }

  // 通知管理
  static async sendNotification(userId, notification) {
    try {
      const notificationRef = push(ref(rtdb, `notifications/${userId}`));
      await set(notificationRef, {
        ...notification,
        read: false,
        timestamp: new Date().toISOString()
      });
      return notificationRef.key;
    } catch (error) {
      console.error('通知送信エラー:', error);
      throw error;
    }
  }

  static subscribeToNotifications(userId, onUpdate) {
    const notificationsRef = ref(rtdb, `notifications/${userId}`);
    onValue(notificationsRef, (snapshot) => {
      const notifications = [];
      snapshot.forEach((childSnapshot) => {
        notifications.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      onUpdate(notifications.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ));
    });

    return () => off(notificationsRef);
  }

  static async markNotificationAsRead(userId, notificationId) {
    try {
      const notificationRef = ref(rtdb, `notifications/${userId}/${notificationId}`);
      await update(notificationRef, {
        read: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('通知更新エラー:', error);
      throw error;
    }
  }

  // カスタムイベント管理
  static async emitCustomEvent(ideaId, eventType, data) {
    try {
      const eventRef = push(ref(rtdb, `events/${ideaId}`));
      await set(eventRef, {
        type: eventType,
        data,
        timestamp: new Date().toISOString()
      });
      return eventRef.key;
    } catch (error) {
      console.error('イベント発行エラー:', error);
      throw error;
    }
  }

  static subscribeToCustomEvents(ideaId, eventType, onUpdate) {
    const eventsRef = ref(rtdb, `events/${ideaId}`);
    const eventQuery = query(eventsRef, 
      orderByChild('type'),
      equalTo(eventType)
    );

    onValue(eventQuery, (snapshot) => {
      const events = [];
      snapshot.forEach((childSnapshot) => {
        events.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      onUpdate(events);
    });

    return () => off(eventsRef);
  }
}