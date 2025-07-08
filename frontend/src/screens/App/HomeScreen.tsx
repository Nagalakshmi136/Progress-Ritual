import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
// import { useAuth } from '../../context/AuthContext'; // Import your auth hook (typed)
import CalendarStrip from '@/src/components/CalenderStrip';
import { commonStyles } from '@/src/assets/styles/common.styles';
import TabSwitcher from '@/src/components/TabSwitcher';
// import SwipeTabs from '@/src/components/SwipeTabs';
import moment from 'moment';
import TaskCard from '@/src/components/TaskCard';
import { Task } from '@/src/types/task';


const sampleTask: Task[] = [{
    id: '1',
    title: 'Design Profile UI',
    description: 'Implement profile layout with calendar & tasks.',
    priority: 'High',
    startTime: '2025-07-07T12:51:00',
    endTime: '2025-07-07T12:59:00',
    streak: 0,
    reward: "awesome",
    points: 10,
    status: 'Active',
}, {
    id: '2',
    title: 'Design Profile UI',
    description: 'Implement profile layout with calendar & tasks.',
    priority: 'High',
    startTime: '2025-07-07T21:00:00',
    endTime: '2025-07-07T21:30:00',
    streak: 0,
    reward: "awesome",
    points: 10,
    status: 'Active',
}];
const HomeScreen: React.FC = () => {
    // Get user and logout function (typed by useAuth hook)
    // const { logout } = useAuth();
    const [taskList, setTaskList] = useState<Task[]>([
        {
            id: '1',
            title: 'Design Profile UI',
            description: 'Implement profile layout with calendar & tasks.',
            priority: 'High',
            startTime: '2025-07-07T21:51:00',
            endTime: '2025-07-07T21:59:00',
            streak: 0,
            reward: 'awesome',
            points: 10,
            status: 'Active',
        },
        {
            id: '2',
            title: 'Review Calendar Logic',
            description: 'Fix end-time  alert issue',
            priority: 'Medium',
            startTime: '2025-07-07T21:00:00',
            endTime: '2025-07-07T21:30:00',
            streak: 1,
            reward: 'coffee',
            points: 5,
            status: 'Completed',
        },
    ]);

    const [selectedTab, setSelectedTab] = useState('Active');
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const handleStatusChange = (taskId: string, newStatus: 'Active' | 'Completed' | 'Backlog' | 'Extended') => {
        setSelectedTab(newStatus);
        // Handle status change logic here, e.g., update task in state or make API call
        console.log(`Task ${taskId} status changed to ${newStatus}`);
    }
    const filteredTasks = taskList.filter((task) => {
        const taskDate = moment(task.startTime).format('YYYY-MM-DD');
        return task.status === selectedTab && taskDate === selectedDate;
    });

    return (
        <View style={commonStyles.container}>
            <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            < TabSwitcher selectedTab={selectedTab} onTabChange={setSelectedTab} />
            <Text style={commonStyles.subtitle}>{selectedDate} {selectedTab}</Text>
            {/* <SwipeTabs /> */}
            {/* Add tasks or agenda under here */}
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onStatusChange={(taskId, newStatus) => {
                            setTaskList((prev) =>
                                prev.map((t) =>
                                    t.id === taskId ? { ...t, status: newStatus } : t
                                )
                            );
                            setSelectedTab(newStatus); // optionally switch to new tab
                        }}
                        onAddPoints={(points) => console.log(`Rewarded with ${points} points`)}
                        onEditTask={(id) => console.log(`Edit Task: ${id}`)}
                        onDeleteTask={(id) => {
                            setTaskList((prev) => prev.filter((t) => t.id !== id));
                            console.log(`Deleted Task: ${id}`);
                        }}
                    />
                )}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 40 }}>
                        No tasks found for this date and status.
                    </Text>
                }
            />

            {/* <PrimaryButton title="Logout" onPress={logout} buttonStyle={{ marginTop: spacing.lg }} > Logout </PrimaryButton> */}
        </View>
    );
};

export default HomeScreen;