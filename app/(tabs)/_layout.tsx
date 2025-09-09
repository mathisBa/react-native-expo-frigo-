import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Frigo",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="kitchen" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Ajouter",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="add-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: "Articles",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="menu" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
