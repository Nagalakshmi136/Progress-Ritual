// src/screens/AddTaskScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';
import { useTaskStore } from '../../store/taskStore';
import moment from 'moment';

const priorities = ['High', 'Medium', 'Low'] as const;
const repeatRules = ['none', 'daily', 'weekly', 'monthly'] as const;

const AddTaskScreen = ({ navigation }: any) => {
    const { selectedDate, createTask, tasks } = useTaskStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 30 * 60000)); // Default +30min
    const [motivationText, setMotivationText] = useState('');
    const [rewardInfo, setRewardInfo] = useState('');
    const [repeatRule, setRepeatRule] = useState<typeof repeatRules[number]>('none');
    const [voicePreference, setVoicePreference] = useState(false);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // ✅ Validation function
    const validateTask = () => {
        if (!title.trim()) {
            Alert.alert('Validation', 'Task name is required.');
            return false;
        }

        const now = moment();
        let taskDate = moment(selectedDate);

        // --- Rule 1: If past date, override with today ---
        if (taskDate.isBefore(now, 'day')) {
            Alert.alert(
                'Invalid Date',
                'You cannot create tasks in the past. It will be set for today.'
            );
            taskDate = now;
        }

        // --- Convert times to moment for comparison ---
        const start = moment(startTime);
        const end = moment(endTime);

        if (end.isSameOrBefore(start)) {
            Alert.alert('Validation', 'End time must be after start time.');
            return false;
        }

        // --- Rule 2: Check overlapping tasks ---
        const overlapping = tasks.some(
            (t) =>
                moment(t.scheduledDate).isSame(taskDate, 'day') &&
                (
                    // Overlap if start < existing end && end > existing start
                    start.isBefore(moment(t.endTime, 'HH:mm')) &&
                    end.isAfter(moment(t.startTime, 'HH:mm'))
                )
        );

        if (overlapping) {
            Alert.alert('Conflict', 'Another task already exists during this time.');
            return false;
        }

        return taskDate;
    };

    const handleSave = async () => {
        const validDate = validateTask();
        if (!validDate) return;

        const taskPayload = {
            title,
            description,
            priority,
            scheduledDate: moment(validDate).format('YYYY-MM-DD'),
            startTime: moment(startTime).format('HH:mm'),
            endTime: moment(endTime).format('HH:mm'),
            motivationText,
            rewardInfo,
            repeatRule,
            voicePreference,
        };

        try {
            await createTask(taskPayload);
            Alert.alert('Success', 'Task created successfully!');
            navigation.goBack();
        } catch (err) {
            console.error('Task creation failed:', err);
            Alert.alert('Error', 'Could not create task. Try again.');
        }
    };

    return (

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} >
            <Text style={styles.label}>Task Name *</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the task"
                multiline
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipGroup}>
                {priorities.map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.chip, priority === p && styles.chipActive]}
                        onPress={() => setPriority(p)}
                    >
                        <Text style={priority === p ? styles.chipTextActive : styles.chipText}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.input}>
                <Text>{moment(startTime).format('hh:mm A')}</Text>
            </TouchableOpacity>
            {showStartPicker && (
                <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, date) => {
                        setShowStartPicker(false);
                        if (date) setStartTime(date);
                    }}
                />
            )}

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.input}>
                <Text>{moment(endTime).format('hh:mm A')}</Text>
            </TouchableOpacity>
            {showEndPicker && (
                <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, date) => {
                        setShowEndPicker(false);
                        if (date) setEndTime(date);
                    }}
                />
            )}

            <Text style={styles.label}>Motivation Text</Text>
            <TextInput
                style={styles.input}
                value={motivationText}
                onChangeText={setMotivationText}
                placeholder="Stay strong! 💪"
            />

            <Text style={styles.label}>Reward Info</Text>
            <TextInput
                style={styles.input}
                value={rewardInfo}
                onChangeText={setRewardInfo}
                placeholder="E.g. Ice cream, Netflix"
            />

            <Text style={styles.label}>Repeat</Text>
            <View style={styles.chipGroup}>
                {repeatRules.map((r) => (
                    <TouchableOpacity
                        key={r}
                        style={[styles.chip, repeatRule === r && styles.chipActive]}
                        onPress={() => setRepeatRule(r)}
                    >
                        <Text style={repeatRule === r ? styles.chipTextActive : styles.chipText}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.switchRow}>
                <Text style={styles.label}>Voice Reminder</Text>
                <Switch value={voicePreference} onValueChange={setVoicePreference} />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save Task</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    chipGroup: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        color: '#333',
    },
    chipTextActive: {
        color: '#fff',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
