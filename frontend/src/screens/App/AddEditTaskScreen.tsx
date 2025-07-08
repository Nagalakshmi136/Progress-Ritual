import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { AppStackParamList } from '../../navigation/AppNavigator';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../api';

import FormInput from '../../../app/components/FormInput';
import PrimaryButton from '../../../app/components/PrimaryButton';
import { colors, spacing, typography } from '../../themes';

// Define navigation and route prop types
type AddEditTaskScreenNavigationProp = StackNavigationProp<AppStackParamList, 'AddEditTask'>;
type AddEditTaskScreenRouteProp = RouteProp<AppStackParamList, 'AddEditTask'>;

// Define form values structure
interface TaskFormValues {
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    repeatRule: 'none' | 'daily' | 'weekly' | 'monthly';
    reminderTime: string;
    reminderType: 'notification' | 'voice';
    motivationText: string;
    rewardInfo: string;
}

// Validation Schema with Yup
const TaskSchema = Yup.object().shape({
    name: Yup.string().required('Task name is required'),
    description: Yup.string(),
    priority: Yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
    scheduledDate: Yup.date().required('A date is required'),
    startTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
    endTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
    // Add more validations
});

const AddEditTaskScreen: React.FC = () => {
    const navigation = useNavigation<AddEditTaskScreenNavigationProp>();
    const route = useRoute<AddEditTaskScreenRouteProp>();
    const { addTask, updateTask, getTaskById, isTasksLoading } = useTasks();

    const taskId = route.params?.taskId;
    const isEditing = !!taskId;

    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // State for date/time pickers
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [pickerTarget, setPickerTarget] = useState<'scheduledDate' | 'startTime' | 'endTime' | 'reminderTime' | null>(null);

    useEffect(() => {
        navigation.setOptions({ headerTitle: isEditing ? 'Edit Task' : 'Create Task' });
        if (isEditing) {
            // Fetch the full task details for editing
            const task = getTaskById(taskId); // Assume getTaskById is added to context
            if (task) {
                setTaskToEdit(task);
            }
        }
    }, [isEditing, taskId, navigation]);

    const initialValues: TaskFormValues = {
        name: taskToEdit?.name || '',
        description: taskToEdit?.description || '',
        priority: taskToEdit?.priority || 'Medium',
        scheduledDate: taskToEdit ? new Date(taskToEdit.scheduledDate) : new Date(),
        startTime: taskToEdit?.startTime || '',
        endTime: taskToEdit?.endTime || '',
        repeatRule: taskToEdit?.repeatRule || 'none',
        reminderTime: taskToEdit?.reminderSettings?.time || '',
        reminderType: taskToEdit?.reminderSettings?.type || 'notification',
        motivationText: taskToEdit?.motivationText || '',
        rewardInfo: taskToEdit?.rewardInfo || '',
    };

    const onChangePicker = (event: DateTimePickerEvent, selectedDate: Date | undefined, setFieldValue: any) => {
        setShowPicker(Platform.OS === 'ios'); // On iOS, the picker stays visible until dismissed
        if (event.type === 'set' && selectedDate && pickerTarget) {
            const formattedValue = pickerTarget === 'scheduledDate'
                ? selectedDate
                : moment(selectedDate).format('HH:mm');
            setFieldValue(pickerTarget, formattedValue);
        }
    };

    const showDatePicker = (target: 'scheduledDate', setFieldValue: any) => {
        setPickerMode('date');
        setPickerTarget(target);
        setShowPicker(true);
    };

    const showTimePicker = (target: 'startTime' | 'endTime' | 'reminderTime', setFieldValue: any) => {
        setPickerMode('time');
        setPickerTarget(target);
        setShowPicker(true);
    };

    const handleFormSubmit = async (values: TaskFormValues, { setSubmitting }: FormikHelpers<TaskFormValues>) => {
        const taskData = {
            ...values,
            scheduledDate: moment(values.scheduledDate).format('YYYY-MM-DD'),
            reminderSettings: {
                time: values.reminderTime,
                type: values.reminderType,
            },
        };

        try {
            if (isEditing && taskId) {
                await updateTask(taskId, taskData);
                Alert.alert('Success', 'Task updated!');
            } else {
                await addTask(taskData);
                Alert.alert('Success', 'Task created!');
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save task.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Formik
                initialValues={initialValues}
                validationSchema={TaskSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize // Important for pre-filling edit form
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                    <View>
                        <FormInput
                            label="Task Name*"
                            value={values.name}
                            onChangeText={handleChange('name')}
                            error={touched.name && errors.name}
                        />
                        {/* ... other FormInput components for description, motivation, etc. */}

                        {/* Scheduled Date Picker */}
                        <TouchableOpacity onPress={() => showDatePicker('scheduledDate', setFieldValue)}>
                            <FormInput
                                label="Date"
                                value={moment(values.scheduledDate).format('LL')} // e.g., "May 31, 2024"
                                editable={false} // Prevent typing
                            />
                        </TouchableOpacity>

                        {/* Time Range Pickers */}
                        <View style={styles.timeRow}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => showTimePicker('startTime', setFieldValue)}>
                                <FormInput label="Start Time" value={values.startTime} editable={false} />
                            </TouchableOpacity>
                            <View style={{ width: spacing.md }} />
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => showTimePicker('endTime', setFieldValue)}>
                                <FormInput label="End Time" value={values.endTime} editable={false} />
                            </TouchableOpacity>
                        </View>

                        {/* ... Add pickers/inputs for Priority, Repeat, Reminder, etc. */}

                        <PrimaryButton
                            title={isEditing ? 'Save Changes' : 'Create Task'}
                            onPress={handleSubmit}
                            loading={isSubmitting || isTasksLoading}
                            disabled={isSubmitting || isTasksLoading}
                        />

                        {/* DateTimePicker Component */}
                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode={pickerMode}
                                is24Hour={true}
                                display="default"
                                onChange={(e, d) => onChangePicker(e, d, setFieldValue)}
                            />
                        )}
                    </View>
                )}
            </Formik>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: spacing.lg },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    // ... other styles
});

export default AddEditTaskScreen;