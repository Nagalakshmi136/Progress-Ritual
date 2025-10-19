import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import moment from 'moment';
import { useTaskStore } from '@/src/store/taskStore';
import { useAuth } from '@/src/context/AuthContext';
import CalendarStrip from '@/src/components/CalenderStrip';
import TabSwitcher from '@/src/components/TabSwitcher';
import TaskCard from '@/src/components/TaskCard';
import { COLORS } from '@/src/constants/colors';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();

    const {
        tasks,
        isLoading,
        selectedDate,
        selectDate,
        fetchTasks,
        deleteTask,
        completeTask,
        backlogTask,
    } = useTaskStore();

    const [selectedTab, setSelectedTab] = useState<'Active' | 'Completed' | 'Backlog'>('Active');

    // ✅ Fetch tasks whenever date or user changes
    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, selectedDate]);

    // ✅ Filter tasks for selected date & tab
    const filteredTasks = useMemo(() => {
        const selectedDay = selectedDate.format('YYYY-MM-DD');
        return tasks.filter(task =>
            task.status?.toLowerCase() === selectedTab.toLowerCase() &&
            moment(task.scheduledDate).format('YYYY-MM-DD') === selectedDay
        );
    }, [tasks, selectedDate, selectedTab]);

    // ✅ Confirm before marking completed/backlog
    const handleStatusChange = (taskId: string, newStatus: 'active' | 'completed' | 'backlog') => {
        if (newStatus === 'completed') {
            Alert.alert('Mark Task Completed', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        await completeTask(taskId);
                        setSelectedTab('Completed');
                    },
                },
            ]);
        } else if (newStatus === 'backlog') {
            Alert.alert('Move to Backlog?', 'This task will be postponed.', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        await backlogTask(taskId);
                        setSelectedTab('Backlog');
                    },
                },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <CalendarStrip selectedDate={selectedDate} onSelectDate={(date) => selectDate(moment(date))} />
            <TabSwitcher selectedTab={selectedTab} onTabChange={setSelectedTab} />

            <Text style={styles.subtitle}>
                {moment(selectedDate).format("MMMM D, YYYY")} - {selectedTab}
            </Text>

            {isLoading && filteredTasks.length === 0 ? (
                <ActivityIndicator size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item, index) => item._id ?? index.toString()}
                    renderItem={({ item }) => (
                        <TaskCard
                            task={item}
                            onStatusChange={handleStatusChange}
                            onAddPoints={(points) => console.log(`+${points} points earned`)}
                            onEditTask={(id) => navigation.navigate('AddTaskScreen', { taskId: id })}
                            onDeleteTask={(id) => deleteTask(id)}
                        />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                🎉 Youre all clear! No tasks in this section.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginLeft: 16,
        marginBottom: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
    },
});

export default HomeScreen;
