export type Task = {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    startTime: string;
    endTime: string;
    streak: number;
    points?: number; // Optional points for task completion
    reward?: string; // Optional reward description
    status: 'Active' | 'Completed' | 'Backlog' | 'Extended';
};