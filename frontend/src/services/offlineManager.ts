// src/services/offlineManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import TaskService from './taskService';

const TASK_CACHE_KEY_PREFIX = 'tasks_';
const OFFLINE_QUEUE_KEY_PREFIX = 'offline_queue_';

interface OfflineAction {
    type: 'create' | 'update' | 'delete' | 'complete' | 'backlog' | 'extend' | 'reactivate';
    taskId?: string;
    data?: Partial<Task>;
}

const OfflineManager = {
    /**
     * ✅ Cache tasks for a specific USER and DATE
     */
    async cacheTasks(userId: string, tasks: Task[]) {
        try {
            await AsyncStorage.setItem(`${TASK_CACHE_KEY_PREFIX}${userId}`, JSON.stringify(tasks));
        } catch (e) {
            console.error('❌ Error caching tasks:', e);
        }
    },

    /**
     * ✅ Get cached tasks for a USER
     */
    async getCachedTasks(userId: string): Promise<Task[]> {
        try {
            const data = await AsyncStorage.getItem(`${TASK_CACHE_KEY_PREFIX}${userId}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('❌ Error reading cached tasks:', e);
            return [];
        }
    },

    /**
     * ✅ Queue an offline action for specific USER
     */
    async addOfflineTask(userId: string, action: OfflineAction) {
        try {
            const queue = await this.getOfflineQueue(userId);
            queue.push(action);
            await AsyncStorage.setItem(`${OFFLINE_QUEUE_KEY_PREFIX}${userId}`, JSON.stringify(queue));
            console.log(`📦 Task queued offline for user ${userId}`);
        } catch (e) {
            console.error('❌ Error adding offline action:', e);
        }
    },

    /**
     * ✅ Get pending offline actions for USER
     */
    async getOfflineQueue(userId: string): Promise<OfflineAction[]> {
        try {
            const data = await AsyncStorage.getItem(`${OFFLINE_QUEUE_KEY_PREFIX}${userId}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('❌ Error reading offline queue:', e);
            return [];
        }
    },

    /**
     * ✅ Clear offline queue after successful sync
     */
    async clearOfflineQueue(userId: string) {
        await AsyncStorage.removeItem(`${OFFLINE_QUEUE_KEY_PREFIX}${userId}`);
    },

    /**
     * ✅ Sync offline actions for a USER
     */
    async syncOfflineTasks(userId: string) {
        if (!userId) {
            console.warn('⚠️ No userId provided, skipping offline sync.');
            return;
        }

        const queue = await this.getOfflineQueue(userId);
        if (!queue.length) return;

        console.log(`🔄 Syncing ${queue.length} offline actions for user ${userId}...`);

        const remaining: OfflineAction[] = [];

        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'create':
                        await TaskService.createTask(action.data!);
                        break;
                    case 'update':
                        if (action.taskId) {
                            await TaskService.updateTask(action.taskId, action.data!);
                        }
                        break;
                    case 'delete':
                        if (action.taskId) {
                            await TaskService.deleteTask(action.taskId);
                        }
                        break;
                    case 'complete':
                        if (action.taskId) {
                            await TaskService.completeTask(action.taskId, action.data);
                        }
                        break;
                    case 'backlog':
                        if (action.taskId) {
                            await TaskService.backlogTask(action.taskId, action.data);
                        }
                        break;
                    case 'extend':
                        if (action.taskId) {
                            await TaskService.extendTask(action.taskId, action.data);
                        }
                        break;
                    case 'reactivate':
                        if (action.taskId) {
                            await TaskService.reactivateTask(action.taskId);
                        }
                        break;
                    default:
                        console.warn('⚠️ Unknown offline action:', action);
                }
            } catch (e) {
                console.error('❌ Failed to sync action, keeping in queue:', action, e);
                remaining.push(action); // keep for retry
            }
        }

        // ✅ Update queue
        if (remaining.length > 0) {
            await AsyncStorage.setItem(`${OFFLINE_QUEUE_KEY_PREFIX}${userId}`, JSON.stringify(remaining));
        } else {
            await this.clearOfflineQueue(userId);
        }

        console.log(`✅ Offline sync complete. Remaining unsynced actions: ${remaining.length}`);
    },
};

export default OfflineManager;
