import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const initialLayout = { width: Dimensions.get('window').width };

const ActiveRoute = () => (
    <View style={styles.scene}>
        <Text>🟢 Active Task 1</Text>
        <Text>🟢 Active Task 2</Text>
    </View>
);

const CompletedRoute = () => (
    <View style={styles.scene}>
        <Text>✅ Completed Task A</Text>
        <Text>✅ Completed Task B</Text>
    </View>
);

const BacklogRoute = () => (
    <View style={styles.scene}>
        <Text>📦 Backlog Item X</Text>
        <Text>📦 Backlog Item Y</Text>
    </View>
);

const renderScene = SceneMap({
    Active: ActiveRoute,
    Completed: CompletedRoute,
    Backlog: BacklogRoute,
});

export default function SwipeTabs() {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'Active', title: 'Active' },
        { key: 'Completed', title: 'Completed' },
        { key: 'Backlog', title: 'Backlog' },
    ]);

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
            renderTabBar={(props) => (
                <TabBar
                    {...props}
                    indicatorStyle={styles.indicator}
                    style={styles.tabbar}
                    activeColor="#8A4FFF"
                    inactiveColor="#888"
                    
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    scene: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    tabbar: {
        backgroundColor: '#fff',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    indicator: {
        backgroundColor: '#8A4FFF',
        height: 3,
        borderRadius: 2,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
        textTransform: 'none',
    },
});
