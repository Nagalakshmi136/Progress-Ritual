import { View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { COLORS } from "../constants/colors";

const SafeScreen = ({ children }: { children: ReactNode }) => {
  // const insets = useSafeAreaInsets();

  return (
    <View style={{flex: 1, backgroundColor: COLORS.background }}>
      {children}
    </View>
  );
};
export default SafeScreen;