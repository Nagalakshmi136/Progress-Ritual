// src/services/tasks.ts
import api from './index'; // Your configured Axios instance from the previous step
import { Task, TaskStats } from '../types/task';

// --- Type Definitions for Function Payloads ---

// Data for creating a task (fields the user provides)
export type CreateTaskData = Pick<Task,
  'title' | 'description' | 'priority' | 'scheduledDate' | 'startTime' | 'endTime' |
  'motivationText' | 'rewardInfo' | 'repeatRule' | 'voicePreference'
> & { basePoints?: number }; // basePoints is optional, backend can default it

// Data for updating a task (all fields are optional)
export type UpdateTaskData = Partial<CreateTaskData>;

// Data for extending a task
export interface ExtendTaskData {
  extensionType: 'increment' | 'deadline' | 'stopwatch_start';
  value?: number | string; // number for minutes, string for ISO date
  userNotes?: string;
}

// Data for completing or backlogging a task
export interface ActionWithNotesData {
  userNotes?: string;
}

// --- API Service Object ---

export const TaskService = {
  /**
   * Creates a new task.
   */
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post<{ task: Task }>('/tasks', data);
    return response.data.task;
  },

  /**
   * Fetches tasks for a ±7 day window around a given date.
   * @param date - The center date in 'YYYY-MM-DD' format.
   */
  getTasks: async (date: string): Promise<Task[]> => {
    const response = await api.get<{ tasks: Task[] }>(`/tasks?date=${date}`);
    return response.data.tasks;
  },

  /**
   * Fetches a single task by its ID.
   */
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await api.get<{ task: Task }>(`/tasks/${taskId}`);
    return response.data.task;
  },

  /**
   * Updates the general details of a task.
   */
  updateTask: async (taskId: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put<{ task: Task }>(`/tasks/${taskId}`, data);
    return response.data.task;
  },

  /**
   * Deletes a task by its ID.
   */
  deleteTask: async (taskId: string): Promise<string> => {
    const response = await api.delete<{ message: string }>(`/tasks/${taskId}`);
    return response.data.message;
  },

  /**
   * Extends a task using one of the defined methods.
   */
  extendTask: async (taskId: string, data: ExtendTaskData): Promise<Task> => {
    const response = await api.post<{ task: Task }>(`/tasks/${taskId}/extend`, data);
    return response.data.task;
  },

  /**
   * Marks a task as completed.
   */
  completeTask: async (taskId: string, data?: ActionWithNotesData): Promise<Task> => {
    const response = await api.post<{ task: Task }>(`/tasks/${taskId}/complete`, data);
    return response.data.task;
  },

  /**
   * Moves a task to the backlog.
   */
  backlogTask: async (taskId: string, data?: ActionWithNotesData): Promise<Task> => {
    const response = await api.post<{ task: Task }>(`/tasks/${taskId}/backlog`, data);
    return response.data.task;
  },

  /**
   * Reactivates a task from backlog or completed status.
   */
  reactivateTask: async (taskId: string): Promise<Task> => {
    const response = await api.post<{ task: Task }>(`/tasks/${taskId}/reactivate`);
    return response.data.task;
  },

  /**
   * Fetches task statistics for the user.
   */
  getTaskStats: async (period: 'week' | 'month' | 'all' = 'week'): Promise<TaskStats> => {
    const response = await api.get<TaskStats>('/tasks/stats', { params: { period } });
    return response.data; // The stats endpoint returns the whole object directly
  },
};