// src/types/task.ts

export interface EventLog {
    type: string; // e.g., 'created', 'delay_increment', 'completed_on_time'
    timestamp: string; // ISO Date string
    details?: {
        userNotes?: string;
        incrementMinutes?: number;
        oldEndTime?: string;
        newEndTime?: string;
        delayMs?: number;
        // Add other details you might log
    };
}

export interface Task {
    _id: string;
    user: string;
    title: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'active' | 'completed' | 'backlog';
    scheduledDate: string; // ISO Date string
    startTime?: string;   // "HH:mm"
    endTime?: string;     // "HH:mm"
    motivationText?: string;
    rewardInfo?: string;
    repeatRule?: 'none' | 'daily' | 'weekly' | 'monthly';
    voicePreference?: boolean;
    basePoints: number;
    earnedPoints: number;
    rewardUnlocked: boolean;
    completedAt?: string; // ISO Date string
    extensionCount: number;
    streak: number;
    eventLog: EventLog[];

    // New fields from your controller
    totalDelayMs?: number;
    delaySessionStart?: string; // ISO Date string

    createdAt: string; // ISO Date string
    updatedAt: string; // ISO Date string
}

// Type for the stats endpoint response
export interface TaskStats {
    summary: {
        status: 'active' | 'completed' | 'backlog';
        count: number;
        totalPoints: number;
        avgPoints: number;
    }[];
    completionBreakdown: {
        _id: 'completed_on_time' | 'completed_with_extension';
        count: number;
    }[];
}