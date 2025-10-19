// src/store/taskStore.ts
import { create } from 'zustand';
import moment, { Moment } from 'moment';
import { Task } from '../types/task';
import TaskService from '../services/taskService';
import OfflineManager from '../services/offlineManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TaskState {
    tasks: Task[];
    selectedDate: Moment;
    isLoading: boolean;
    userId: string | null;

    selectDate: (date: Moment) => void;
    initializeStore: () => Promise<void>;
    fetchTasks: () => Promise<void>;
    createTask: (taskData: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    completeTask: (taskId: string, data?: any) => Promise<void>;
    backlogTask: (taskId: string, data?: any) => Promise<void>;
    reactivateTask: (taskId: string) => Promise<void>;
    extendTask: (taskId: string, data: any) => Promise<void>;
    syncOfflineTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    selectedDate: moment(),
    isLoading: false,
    userId: null,

    // ✅ Change selected date
    selectDate: (date) => set({ selectedDate: date }),

    // ✅ Load cached tasks and userId on app start
    initializeStore: async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                set({ userId: parsedUser.id });

                const cachedTasks = await OfflineManager.getCachedTasks(parsedUser.id);
                if (cachedTasks) {
                    set({ tasks: cachedTasks });
                }
            }
        } catch (error) {
            console.error('❌ Failed to initialize store:', error);
        }
    },

    // ✅ Fetch tasks from backend or cache
    fetchTasks: async () => {
        set({ isLoading: true });
        const date = get().selectedDate.format('YYYY-MM-DD');
        const { userId } = get();

        try {
            // Sync pending offline actions first
            if (userId) {
                await OfflineManager.syncOfflineTasks(userId);
            }

            // Fetch tasks from server
            const { data } = await TaskService.getTasks(date);
            set({ tasks: data.tasks });

            // Cache tasks locally
            if (userId) {
                await OfflineManager.cacheTasks(userId, data.tasks);
            }
        } catch (error) {
            console.warn('⚠️ Network failed, loading cached tasks');
            if (userId) {
                const cachedTasks = await OfflineManager.getCachedTasks(userId);
                set({ tasks: cachedTasks || [] });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    // ✅ Create task
    createTask: async (taskData) => {
        const { tasks, userId } = get();
        try {
            const { data } = await TaskService.createTask(taskData);
            const updatedList = [...tasks, data.task];
            set({ tasks: updatedList });

            if (userId) await OfflineManager.cacheTasks(userId, updatedList);
        } catch (error) {
            console.warn('⚠️ Offline mode: queued task create');
            if (userId) {
                await OfflineManager.addOfflineTask(userId, { type: 'create', data: taskData });
                const offlineTask = { ...taskData, _id: `local-${Date.now()}` } as Task;
                set({ tasks: [...tasks, offlineTask] });
                await OfflineManager.cacheTasks(userId, get().tasks);
            }
        }
    },

    // ✅ Update task
    updateTask: async (taskId, updates) => {
        const { tasks, userId } = get();
        const updatedList = tasks.map((t) => (t._id === taskId ? { ...t, ...updates } : t));
        set({ tasks: updatedList });
        if (userId) await OfflineManager.cacheTasks(userId, updatedList);

        try {
            await TaskService.updateTask(taskId, updates);
        } catch (error) {
            console.warn('⚠️ Offline mode: queued task update');
            if (userId) {
                await OfflineManager.addOfflineTask(userId, { type: 'update', data: { _id: taskId, ...updates } });
            }
        }
    },

    // ✅ Delete task
    deleteTask: async (taskId) => {
        const { tasks, userId } = get();
        const updatedList = tasks.filter((t) => t._id !== taskId);
        set({ tasks: updatedList });
        if (userId) await OfflineManager.cacheTasks(userId, updatedList);

        try {
            await TaskService.deleteTask(taskId);
        } catch (error) {
            console.warn('⚠️ Offline mode: queued task delete');
            if (userId) {
                await OfflineManager.addOfflineTask(userId, { type: 'delete', data: { _id: taskId } });
            }
        }
    },

    // ✅ Complete task
    completeTask: async (taskId, data = {}) => {
        const { tasks, userId } = get();
        try {
            const { data: res } = await TaskService.completeTask(taskId, data);
            const updatedList = tasks.map((t) => (t._id === taskId ? res.task : t));
            set({ tasks: updatedList });
            if (userId) await OfflineManager.cacheTasks(userId, updatedList);
        } catch (error) {
            console.warn('⚠️ Offline mode: queued task completion');
            if (userId) await OfflineManager.addOfflineTask(userId, { type: 'complete', data: { taskId, ...data } });
        }
    },

    // ✅ Backlog task
    backlogTask: async (taskId, data = {}) => {
        const { tasks, userId } = get();
        try {
            const { data: res } = await TaskService.backlogTask(taskId, data);
            const updatedList = tasks.map((t) => (t._id === taskId ? res.task : t));
            set({ tasks: updatedList });
            if (userId) await OfflineManager.cacheTasks(userId, updatedList);
        } catch (error) {
            console.warn('⚠️ Offline mode: queued backlog action');
            if (userId) await OfflineManager.addOfflineTask(userId, { type: 'backlog', data: { taskId, ...data } });
        }
    },

    // ✅ Reactivate task
    reactivateTask: async (taskId) => {
        const { tasks, userId } = get();
        try {
            const { data: res } = await TaskService.reactivateTask(taskId);
            const updatedList = tasks.map((t) => (t._id === taskId ? res.task : t));
            set({ tasks: updatedList });
            if (userId) await OfflineManager.cacheTasks(userId, updatedList);
        } catch (error) {
            if (userId) await OfflineManager.addOfflineTask(userId, { type: 'reactivate', taskId });
        }
    },

    // ✅ Extend task
    extendTask: async (taskId, data) => {
        const { tasks, userId } = get();
        try {
            const { data: res } = await TaskService.extendTask(taskId, data);
            const updatedList = tasks.map((t) => (t._id === taskId ? res.task : t));
            set({ tasks: updatedList });
            if (userId) await OfflineManager.cacheTasks(userId, updatedList);
        } catch (error) {
            if (userId) await OfflineManager.addOfflineTask(userId, { type: 'extend', data: { taskId, ...data } });
        }
    },

    // ✅ Sync offline tasks after login
    syncOfflineTasks: async () => {
        let { userId } = get();
        if (!userId) {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                userId = JSON.parse(storedUser).id;
                set({ userId });
            }
        }
        if (!userId) return;

        await OfflineManager.syncOfflineTasks(userId);
        await get().fetchTasks();
    },
}));
