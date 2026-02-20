import { Tabs } from "expo-router";
import {
  Activity,
  Building2,
  CircleGauge,
  ScanSearch,
  PlugZap,
} from "lucide-react-native";
import { theme } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.amber,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <CircleGauge color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accounts/index"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pipeline/index"
        options={{
          title: "Pipeline",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scanner/index"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => <ScanSearch color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="connections/index"
        options={{
          title: "Connections",
          tabBarIcon: ({ color, size }) => <PlugZap color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
