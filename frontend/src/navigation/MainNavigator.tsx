import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/App/HomeScreen";
import EventsScreen from "../screens/App/EventsScreen";
import CustomHeader from "../components/CustomHeader";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
// import TasksScreen from "../screens/App/TasksScreen";
interface CustomTabBarButtonProps {
  children: React.ReactNode;
  onPress?: (e?: any) => void;
}

const CustomTabBarButton: React.FC<CustomTabBarButtonProps> = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -30,
      justifyContent: "center",
      alignItems: "center",
    }}
    onPress={e => onPress?.(e)}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 5 },
      shadowRadius: 10,
      elevation: 8,
      zIndex: 10,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);
export default function MainNavigator() {
  const Tab = createBottomTabNavigator();
  const points = useAuth().user?.points || 0;
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      header: () => (
        <CustomHeader
          title={route.name}
          points={points}
        />
      ),
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: {
        position: "absolute",
        elevation: 0,
        backgroundColor: COLORS.white,
        paddingBottom: 8,
        paddingTop: 8,
        height: 80,

      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{
        title: "Tasks",
        tabBarIcon: ({ color, size, focused }) => <MaterialCommunityIcons name={focused ? "clipboard-text" : "clipboard-text-outline"} size={size} color={color} />,
      }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{
        title: "Explore",
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />,
      }} />
      <Tab.Screen name="AddTask" component={HomeScreen} options={{
        tabBarIcon: () => <Ionicons name={"add"} size={30} color={COLORS.white} />,
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} />
        ),
        tabBarLabel: () => null,
      }} />
      <Tab.Screen name="Alarm" component={HomeScreen} options={{
        title: "Alarm",
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "alarm" : "alarm-outline"} size={size} color={color} />,
      }} />
      <Tab.Screen name="Profile" component={HomeScreen} options={{
        title: "Profile",
        tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />,
      }} />
    </Tab.Navigator>
  );
}