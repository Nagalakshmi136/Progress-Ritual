// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { Formik, FormikHelpers } from 'formik';
// import * as Yup from 'yup';
// import moment from 'moment';
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// import { AppStackParamList } from '../../navigation/AppNavigator';
// import { useTasks } from '../../context/TaskContext';
// import { Task } from '../../api';

// import FormInput from '../../../app/components/FormInput';
// import PrimaryButton from '../../../app/components/PrimaryButton';
// import { colors, spacing, typography } from '../../themes';

// // Define navigation and route prop types
// type AddEditTaskScreenNavigationProp = StackNavigationProp<AppStackParamList, 'AddEditTask'>;
// type AddEditTaskScreenRouteProp = RouteProp<AppStackParamList, 'AddEditTask'>;

// // Define form values structure
// interface TaskFormValues {
//     name: string;
//     description: string;
//     priority: 'High' | 'Medium' | 'Low';
//     scheduledDate: Date;
//     startTime: string;
//     endTime: string;
//     repeatRule: 'none' | 'daily' | 'weekly' | 'monthly';
//     reminderTime: string;
//     reminderType: 'notification' | 'voice';
//     motivationText: string;
//     rewardInfo: string;
// }

// // Validation Schema with Yup
// const TaskSchema = Yup.object().shape({
//     name: Yup.string().required('Task name is required'),
//     description: Yup.string(),
//     priority: Yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
//     scheduledDate: Yup.date().required('A date is required'),
//     startTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
//     endTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'),
//     // Add more validations
// });

// const AddEditTaskScreen: React.FC = () => {
//     const navigation = useNavigation<AddEditTaskScreenNavigationProp>();
//     const route = useRoute<AddEditTaskScreenRouteProp>();
//     const { addTask, updateTask, getTaskById, isTasksLoading } = useTasks();

//     const taskId = route.params?.taskId;
//     const isEditing = !!taskId;

//     const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

//     // State for date/time pickers
//     const [date, setDate] = useState(new Date());
//     const [showPicker, setShowPicker] = useState(false);
//     const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
//     const [pickerTarget, setPickerTarget] = useState<'scheduledDate' | 'startTime' | 'endTime' | 'reminderTime' | null>(null);

//     useEffect(() => {
//         navigation.setOptions({ headerTitle: isEditing ? 'Edit Task' : 'Create Task' });
//         if (isEditing) {
//             // Fetch the full task details for editing
//             const task = getTaskById(taskId); // Assume getTaskById is added to context
//             if (task) {
//                 setTaskToEdit(task);
//             }
//         }
//     }, [isEditing, taskId, navigation]);

//     const initialValues: TaskFormValues = {
//         name: taskToEdit?.name || '',
//         description: taskToEdit?.description || '',
//         priority: taskToEdit?.priority || 'Medium',
//         scheduledDate: taskToEdit ? new Date(taskToEdit.scheduledDate) : new Date(),
//         startTime: taskToEdit?.startTime || '',
//         endTime: taskToEdit?.endTime || '',
//         repeatRule: taskToEdit?.repeatRule || 'none',
//         reminderTime: taskToEdit?.reminderSettings?.time || '',
//         reminderType: taskToEdit?.reminderSettings?.type || 'notification',
//         motivationText: taskToEdit?.motivationText || '',
//         rewardInfo: taskToEdit?.rewardInfo || '',
//     };

//     const onChangePicker = (event: DateTimePickerEvent, selectedDate: Date | undefined, setFieldValue: any) => {
//         setShowPicker(Platform.OS === 'ios'); // On iOS, the picker stays visible until dismissed
//         if (event.type === 'set' && selectedDate && pickerTarget) {
//             const formattedValue = pickerTarget === 'scheduledDate'
//                 ? selectedDate
//                 : moment(selectedDate).format('HH:mm');
//             setFieldValue(pickerTarget, formattedValue);
//         }
//     };

//     const showDatePicker = (target: 'scheduledDate', setFieldValue: any) => {
//         setPickerMode('date');
//         setPickerTarget(target);
//         setShowPicker(true);
//     };

//     const showTimePicker = (target: 'startTime' | 'endTime' | 'reminderTime', setFieldValue: any) => {
//         setPickerMode('time');
//         setPickerTarget(target);
//         setShowPicker(true);
//     };

//     const handleFormSubmit = async (values: TaskFormValues, { setSubmitting }: FormikHelpers<TaskFormValues>) => {
//         const taskData = {
//             ...values,
//             scheduledDate: moment(values.scheduledDate).format('YYYY-MM-DD'),
//             reminderSettings: {
//                 time: values.reminderTime,
//                 type: values.reminderType,
//             },
//         };

//         try {
//             if (isEditing && taskId) {
//                 await updateTask(taskId, taskData);
//                 Alert.alert('Success', 'Task updated!');
//             } else {
//                 await addTask(taskData);
//                 Alert.alert('Success', 'Task created!');
//             }
//             navigation.goBack();
//         } catch (error: any) {
//             Alert.alert('Error', error.message || 'Failed to save task.');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//             <Formik
//                 initialValues={initialValues}
//                 validationSchema={TaskSchema}
//                 onSubmit={handleFormSubmit}
//                 enableReinitialize // Important for pre-filling edit form
//             >
//                 {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
//                     <View>
//                         <FormInput
//                             label="Task Name*"
//                             value={values.name}
//                             onChangeText={handleChange('name')}
//                             error={touched.name && errors.name}
//                         />
//                         {/* ... other FormInput components for description, motivation, etc. */}

//                         {/* Scheduled Date Picker */}
//                         <TouchableOpacity onPress={() => showDatePicker('scheduledDate', setFieldValue)}>
//                             <FormInput
//                                 label="Date"
//                                 value={moment(values.scheduledDate).format('LL')} // e.g., "May 31, 2024"
//                                 editable={false} // Prevent typing
//                             />
//                         </TouchableOpacity>

//                         {/* Time Range Pickers */}
//                         <View style={styles.timeRow}>
//                             <TouchableOpacity style={{ flex: 1 }} onPress={() => showTimePicker('startTime', setFieldValue)}>
//                                 <FormInput label="Start Time" value={values.startTime} editable={false} />
//                             </TouchableOpacity>
//                             <View style={{ width: spacing.md }} />
//                             <TouchableOpacity style={{ flex: 1 }} onPress={() => showTimePicker('endTime', setFieldValue)}>
//                                 <FormInput label="End Time" value={values.endTime} editable={false} />
//                             </TouchableOpacity>
//                         </View>

//                         {/* ... Add pickers/inputs for Priority, Repeat, Reminder, etc. */}

//                         <PrimaryButton
//                             title={isEditing ? 'Save Changes' : 'Create Task'}
//                             onPress={handleSubmit}
//                             loading={isSubmitting || isTasksLoading}
//                             disabled={isSubmitting || isTasksLoading}
//                         />

//                         {/* DateTimePicker Component */}
//                         {showPicker && (
//                             <DateTimePicker
//                                 value={date}
//                                 mode={pickerMode}
//                                 is24Hour={true}
//                                 display="default"
//                                 onChange={(e, d) => onChangePicker(e, d, setFieldValue)}
//                             />
//                         )}
//                     </View>
//                 )}
//             </Formik>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: colors.background },
//     contentContainer: { padding: spacing.lg },
//     timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
//     // ... other styles
// });

// export default AddEditTaskScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Switch, Appbar } from 'react-native-paper';

import { RootStackParamList } from '@/src/navigation/AppNavigator'; // Using RootStack for modals
import { useTaskStore } from '@/src/store/taskStore';
import { Task } from '@/src/types/task';

import FormInput from '@/src/components/FormInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import SegmentedPicker from '@/src/components/SegmentedPicker';
import { colors, spacing, typography } from '@/src/theme';

// Define navigation and route prop types
type AddEditTaskScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'AddEditTask'>;
    route: RouteProp<RootStackParamList, 'AddEditTask'>;
};

// Define form values structure
interface TaskFormValues {
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    repeatRule: 'none' | 'daily' | 'weekly' | 'monthly';
    reminderType: 'notification' | 'voice';
    motivationText: string;
    rewardInfo: string;
}

// Validation Schema using Yup
const TaskSchema = Yup.object().shape({
    name: Yup.string().trim().min(3, 'Name is too short').required('Task name is required'),
    description: Yup.string().trim(),
    priority: Yup.string().oneOf(['High', 'Medium', 'Low']).required(),
    scheduledDate: Yup.date().required(),
    startTime: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Use HH:mm format', excludeEmptyString: true }),
    endTime: Yup.string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Use HH:mm format', excludeEmptyString: true })
        .when('startTime', (startTime, schema) =>
            startTime ? schema.test({
                name: 'is-after-start',
                message: 'End time must be after start time',
                test: endTime => !startTime || !endTime || moment(endTime, 'HH:mm').isAfter(moment(startTime, 'HH:mm')),
            }) : schema
        ),
});

const AddEditTaskScreen: React.FC<AddEditTaskScreenProps> = ({ navigation, route }) => {
    const { addTask, updateTask, getTaskById, isLoading } = useTaskStore();
    const taskId = route.params?.taskId;
    const isEditing = !!taskId;

    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isFetching, setIsFetching] = useState(isEditing);

    // State for date/time pickers
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [pickerTarget, setPickerTarget] = useState<keyof TaskFormValues | null>(null);

    useEffect(() => {
        navigation.setOptions({ headerTitle: isEditing ? 'Edit Task' : 'Create Task' });
        if (isEditing) {
            const task = getTaskById(taskId);
            if (task) {
                setTaskToEdit(task);
            } else {
                Alert.alert('Error', 'Task not found.');
                navigation.goBack();
            }
            setIsFetching(false);
        }
    }, [isEditing, taskId]);

    const initialValues: TaskFormValues = {
        name: taskToEdit?.name || '',
        description: taskToEdit?.description || '',
        priority: taskToEdit?.priority || 'Medium',
        scheduledDate: taskToEdit ? moment(taskToEdit.scheduledDate).toDate() : new Date(),
        startTime: taskToEdit?.startTime || '',
        endTime: taskToEdit?.endTime || '',
        repeatRule: taskToEdit?.repeatRule || 'none',
        reminderType: taskToEdit?.voicePreference ? 'voice' : 'notification',
        motivationText: taskToEdit?.motivationText || '',
        rewardInfo: taskToEdit?.rewardInfo || '',
    };

    const onPickerChange = (event: DateTimePickerEvent, selectedValue: Date | undefined, setFieldValue: FormikHelpers<TaskFormValues>['setFieldValue']) => {
        setShowPicker(Platform.OS === 'ios');
        if (event.type === 'set' && selectedValue && pickerTarget) {
            const formattedValue = pickerTarget === 'scheduledDate' ? selectedValue : moment(selectedValue).format('HH:mm');
            setFieldValue(pickerTarget, formattedValue);
        }
    };

    const showDateTimePicker = (target: keyof TaskFormValues, mode: 'date' | 'time', setFieldValue: any) => {
        setPickerMode(mode);
        setPickerTarget(target);
        setShowPicker(true);
    };

    const handleFormSubmit = async (values: TaskFormValues, { setSubmitting }: FormikHelpers<TaskFormValues>) => {
        const taskData = {
            ...values,
            scheduledDate: moment(values.scheduledDate).format('YYYY-MM-DD'),
            voicePreference: values.reminderType === 'voice',
        };

        try {
            if (isEditing && taskId) {
                await updateTask(taskId, taskData);
            } else {
                await addTask(taskData);
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save task.');
        } finally {
            setSubmitting(false);
        }
    };

    if (isFetching) {
        return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
    }

    return (
        <>
            <Appbar.Header style={{ backgroundColor: colors.primary }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.text} />
                <Appbar.Content title={isEditing ? 'Edit Task' : 'Create Task'} titleStyle={{ color: colors.text }} />
            </Appbar.Header>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                <Formik
                    initialValues={initialValues}
                    validationSchema={TaskSchema}
                    onSubmit={handleFormSubmit}
                    enableReinitialize
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                        <View>
                            <Text style={styles.sectionTitle}>Core Details</Text>
                            <FormInput label="Task Name*" value={values.name} onChangeText={handleChange('name')} onBlur={handleBlur('name')} error={touched.name ? errors.name : undefined} />
                            <FormInput label="Description" value={values.description} onChangeText={handleChange('description')} onBlur={handleBlur('description')} multiline />
                            <SegmentedPicker label="Priority*" options={[{ label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }]} selectedValue={values.priority} onValueChange={(v) => setFieldValue('priority', v)} />

                            <View style={styles.separator} />
                            <Text style={styles.sectionTitle}>Scheduling</Text>

                            <TouchableOpacity onPress={() => showDateTimePicker('scheduledDate', 'date', setFieldValue)}>
                                <FormInput label="Date*" value={moment(values.scheduledDate).format('LL')} editable={false} right={<FormInput.Icon icon="calendar" />} />
                            </TouchableOpacity>

                            <View style={styles.timeRow}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => showDateTimePicker('startTime', 'time', setFieldValue)}>
                                    <FormInput label="Start Time" value={values.startTime} editable={false} error={touched.startTime ? errors.startTime : undefined} right={<FormInput.Icon icon="clock-outline" />} />
                                </TouchableOpacity>
                                <View style={{ width: spacing.md }} />
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => showDateTimePicker('endTime', 'time', setFieldValue)}>
                                    <FormInput label="End Time" value={values.endTime} editable={false} error={touched.endTime ? errors.endTime : undefined} right={<FormInput.Icon icon="clock-time-four-outline" />} />
                                </TouchableOpacity>
                            </View>

                            <SegmentedPicker label="Repeat" options={[{ label: 'None', value: 'none' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }]} selectedValue={values.repeatRule} onValueChange={(v) => setFieldValue('repeatRule', v)} />

                            <View style={styles.separator} />
                            <Text style={styles.sectionTitle}>Motivation & Reward</Text>

                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Voice Reminder</Text>
                                <Switch value={values.reminderType === 'voice'} onValueChange={(isToggled) => setFieldValue('reminderType', isToggled ? 'voice' : 'notification')} color={colors.secondary} />
                            </View>

                            <FormInput label="Motivation Message" value={values.motivationText} onChangeText={handleChange('motivationText')} onBlur={handleBlur('motivationText')} />
                            <FormInput label="Reward Info" value={values.rewardInfo} onChangeText={handleChange('rewardInfo')} onBlur={handleBlur('rewardInfo')} />

                            <PrimaryButton title={isEditing ? 'Save Changes' : 'Create Task'} onPress={handleSubmit} loading={isSubmitting || isLoading} disabled={isSubmitting || isLoading} style={{ marginTop: spacing.lg }} />
                        </View>
                    )}
                </Formik>

                {showPicker && (
                    <DateTimePicker
                        value={pickerTarget === 'scheduledDate' ? values.scheduledDate : moment(values[pickerTarget] || '00:00', 'HH:mm').toDate()}
                        mode={pickerMode}
                        is24Hour={true}
                        display="default"
                        onChange={(e, d) => onPickerChange(e, d, setFieldValue)}
                    />
                )}
            </ScrollView>
        </>
    );
};

// ... (Add StyleSheet from previous AddEditTaskScreen implementation)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: spacing.lg, paddingBottom: 50 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
    separator: { height: 1, backgroundColor: colors.surface, marginVertical: spacing.lg },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, paddingVertical: spacing.sm },
    switchLabel: { ...typography.body, color: colors.text },
});


export default AddEditTaskScreen;