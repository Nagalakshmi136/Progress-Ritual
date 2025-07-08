import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment';

import { useTasks } from '../../context/TaskContext';
import AppBar from '../../../app/components/AppBar'; // Your custom AppBar
import DateSelector from '../../../app/components/DateSelector';
import TaskSection from '../../../app/components/TaskSection';
import AddTaskFAB from '../../../app/components/AddTaskFAB';

import { colors } from '../../themes/colors';
import { spacing } from '../../themes/spacing';
import { typography } from '../../themes/typography';

const TasksScreen: React.FC = () => {
  const { tasks, isTasksLoading, tasksError, selectedDate } = useTasks();
  const navigation = useNavigation();

  // State to manage which tab is selected: 0 for Active, 1 for Completed, 2 for Backlog
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // --- Date-based Logic ---
  const today = moment().startOf('day');
  const isPastDate = selectedDate.isBefore(today, 'day');
  const canAddTask = selectedDate.isSameOrAfter(today, 'day');

  // Adjust tabs based on date
  const tabs = canAddTask ? ['Active', 'Completed', 'Backlog'] : ['Completed', 'Backlog'];
  const activeTabIndex = canAddTask ? selectedTabIndex : selectedTabIndex + 1; // Adjust index for past dates

  // --- Filtering Logic ---
  // useMemo will re-calculate these arrays only when `tasks` or `activeTabIndex` changes
  const filteredTasks = useMemo(() => {
    let currentTasks = [];
    if (activeTabIndex === 0) { // Active
      currentTasks = tasks.filter(t => t.status === 'active');
    } else if (activeTabIndex === 1) { // Completed
      currentTasks = tasks.filter(t => t.status === 'completed');
    } else if (activeTabIndex === 2) { // Backlog
      currentTasks = tasks.filter(t => t.status === 'backlog');
    }
    return currentTasks;
  }, [tasks, activeTabIndex]);

  // --- Content Rendering ---
  const renderContent = () => {
    if (isTasksLoading) {
      return <ActivityIndicator style={styles.loader} size="large" color={colors.secondary} />;
    }

    if (tasksError) {
      return <Text style={styles.errorText}>Error: {tasksError.message}</Text>;
    }

    if (filteredTasks.length === 0) {
      return <Text style={styles.emptyText}>No tasks in this section.</Text>;
    }

    // Use TaskSection to display the filtered tasks
    // The key is necessary to help React efficiently re-render when the tab changes
    return <TaskSection key={tabs[selectedTabIndex]} title={tabs[selectedTabIndex]} tasks={filteredTasks} />;
  };

  return (
    <View style={styles.container}>
      {/* 1. Custom App Bar */}
      <AppBar title={selectedDate.isSame(today, 'day') ? 'Today' : selectedDate.format('MMM D')} />

      {/* 2. Date Selector */}
      <DateSelector />

      {/* 3. Segmented Control for Sections */}
      <View style={styles.segmentedControlContainer}>
        <SegmentedControlTab
          values={tabs}
          selectedIndex={selectedTabIndex}
          onTabPress={setSelectedTabIndex}
          // Theming for a modern, "magical" look
          tabsContainerStyle={styles.tabsContainerStyle}
          tabStyle={styles.tabStyle}
          activeTabStyle={styles.activeTabStyle}
          tabTextStyle={styles.tabTextStyle}
          activeTabTextStyle={styles.activeTabTextStyle}
        />
      </View>

      {/* 4. Task Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>

      {/* 5. Floating Action Button (conditionally rendered) */}
      {canAddTask && <AddTaskFAB />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  segmentedControlContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Ensure space for the FAB
  },
  // --- Segmented Control Styles ---
  tabsContainerStyle: {
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  tabStyle: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  activeTabStyle: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
    borderWidth: 1,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  tabTextStyle: {
    ...typography.button,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabTextStyle: {
    color: colors.text,
  },
});

export default TasksScreen;