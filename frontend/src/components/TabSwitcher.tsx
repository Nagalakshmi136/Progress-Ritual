import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

interface TabSwitcherProps {
    selectedTab: string;
    onTabChange: (tab: string) => void;
}
const TabSwitcher: React.FC<TabSwitcherProps> = ({ selectedTab, onTabChange }) => {
    const Tabs = ["Active", "Completed", "Backlog"];
    return (
        <View style={styles.tabContainer}>
            {Tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tabButton, tab === selectedTab && styles.tabButtonActive]
                    }
                    onPress={() => onTabChange(tab)}
                >
                    <Text style={[styles.tabText, tab === selectedTab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>))}

        </View>

    );
}
const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 10,
        borderRadius: 10,
        // backgroundColor:COLORS.,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        color: '#777',
        fontWeight: '500',
    },
    tabTextActive: {
        color: COLORS.white,
    },

})
export default TabSwitcher;