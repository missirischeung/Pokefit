import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
                }}
            />

            {/* New MVP tabs */}
            <Tabs.Screen
                name="collection"
                options={{
                    title: "Collection",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="square.stack.3d.down.right" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="purchase"
                options={{
                    title: "Purchase",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="square.stack.3d.down.right" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pack-opening"
                options={{
                    title: "Open Packs!",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="square.stack.3d.down.right" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
