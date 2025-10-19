import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import { COLORS } from '../constants/colors';
import { Task } from '../types/task';
import { getPriorityColor } from '../utils/colors';

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, newStatus: Task['status']) => void;
    onAddPoints: (points: number) => void;
    onDeleteTask?: (taskId: string) => void;
    onEditTask?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onAddPoints, onDeleteTask, onEditTask }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [countdownStarted, setCountdownStarted] = useState(false);
    const dialogShownRef = useRef(false);

    const taskId = task._id || '';

    const handleCheckboxPress = () => {
        if (task.status === 'completed') return;

        Alert.alert(
            'Mark as Completed?',
            'Are you sure you completed this task?',
            [
                {
                    text: 'Yes',
                    onPress: () => {
                        onStatusChange(taskId, 'completed');
                        onAddPoints(task.basePoints || 10);
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const start = moment(`${task.scheduledDate} ${task.startTime}`, 'YYYY-MM-DD HH:mm');
            const end = moment(`${task.scheduledDate} ${task.endTime}`, 'YYYY-MM-DD HH:mm');
            const now = moment();

            if (now.isBetween(start, end)) {
                setCountdownStarted(true);
                const duration = moment.duration(end.diff(now));
                const mins = Math.floor(duration.asMinutes());
                const secs = duration.seconds();
                setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
            } else {
                setCountdownStarted(false);
            }

            if (now.isSameOrAfter(end) && !dialogShownRef.current && task.status === 'active') {
                dialogShownRef.current = true;
                showEndDialog();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [task]);

    const showEndDialog = () => {
        Alert.alert(
            '⏱ Task Time Finished',
            'The time for this task has ended. What would you like to do?',
            [
                { text: 'Completed', onPress: () => onStatusChange(taskId, 'completed') },
                { text: 'Edit', onPress: () => onEditTask?.(taskId) },
                { text: 'Delete', onPress: () => onDeleteTask?.(taskId), style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <TouchableOpacity onPress={handleCheckboxPress}>
                    <MaterialCommunityIcons
                        name={task.status === 'completed' ? 'check-circle' : 'circle-outline'}
                        size={24}
                        color={task.status === 'completed' ? COLORS.success : COLORS.primary}
                    />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, task.status === 'completed' && styles.titleCompleted]}>
                        {task.title}
                    </Text>
                    <Text style={[styles.priority, { color: getPriorityColor(task.priority) }]}>
                        {task.priority}
                    </Text>
                </View>
            </View>

            {task.description && (
                <Text style={[styles.description, task.status === 'completed' && styles.descriptionCompleted]}>
                    {task.description}
                </Text>
            )}

            <View style={styles.footer}>
                <Text style={styles.timeRange}>
                    {moment(`${task.scheduledDate} ${task.startTime}`, 'YYYY-MM-DD HH:mm').format('h:mm A')} -{' '}
                    {moment(`${task.scheduledDate} ${task.endTime}`, 'YYYY-MM-DD HH:mm').format('h:mm A')}
                </Text>

                {task.streak !== undefined && (
                    <View style={styles.streakSection}>
                        <MaterialCommunityIcons name="fire" size={16} color="#FF5722" />
                        <Text style={styles.streak}>{task.streak}</Text>
                    </View>
                )}

                {countdownStarted && (
                    <View style={styles.timeSection}>
                        <Ionicons name="alarm" size={16} color="#55b0f3" />
                        <Text style={styles.timeLeft}>{timeLeft} left</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    header: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 8 },
    title: { fontWeight: '600', fontSize: 16, color: '#333' },
    titleCompleted: { textDecorationLine: 'line-through', color: '#999' },
    priority: { fontWeight: 'bold', fontSize: 13 },
    description: { color: '#666', fontSize: 14, marginBottom: 10 },
    descriptionCompleted: { textDecorationLine: 'line-through', color: '#aaa' },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
    streakSection: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF3E0', borderRadius: 12, padding: 4 },
    streak: { fontSize: 13, color: '#FF5722', fontWeight: '600' },
    timeLeft: { fontSize: 13, color: '#444' },
    timeRange: { fontSize: 13, color: '#eb118e' },
    timeSection: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 4 },
});

export default TaskCard;
