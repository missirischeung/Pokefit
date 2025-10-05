import {
    //test
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Button,
    TouchableOpacity,
    RefreshControl,
    Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import StatCard from "../../components/statcard";

export default function ProfileScreen() {
    const [trainer, setTrainer] = useState({
        name: "Ash Ketchum",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/ash.png",
        cardsCollected: 42,
        coins: 1200,
        stepsForPack: 15342,
        allTimeSteps: 25432,
        lastSynced: new Date().toLocaleString(),
    });

    //Sync Feature
    const [refreshing, setRefreshing] = useState(false);

    //Card Popup Feature
    const scrollRef = useRef<ScrollView>(null);
    const [showPack, setShowPack] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current; // for smooth fade-in

    // Slide-up modal animation
    const slideAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible

    // Conversion logic
    const stepsPerPoint = 100; // 100 steps = 1 point
    const packCost = 100; // 100 points = new pack
    const stepsPerPack = stepsPerPoint * packCost; // 10,000 steps = 1 pack

    const packsEarned = Math.floor(trainer.allTimeSteps / stepsPerPack);
    const stepsUsed = packsEarned * stepsPerPack;
    const stepsIntoCurrent = trainer.allTimeSteps - stepsUsed;
    const stepsRemaining = stepsPerPack - stepsIntoCurrent;

    const progress = stepsIntoCurrent / stepsPerPack;

    const totalPoints = Math.floor(trainer.allTimeSteps / stepsPerPoint);
    const pointsIntoCurrentPack = totalPoints % packCost;
    const pointsRemaining = packCost - pointsIntoCurrentPack;
    const pointProgress = pointsIntoCurrentPack / packCost;

    // Refresh handler
    const onRefresh = () => {
        setRefreshing(true);

        // simulate fetching new data (e.g. from Apple Health / backend)
        setTimeout(() => {
            setTrainer((prev) => ({
                ...prev,
                allTimeSteps:
                    prev.allTimeSteps + Math.floor(Math.random() * 1000), // simulate more steps
                lastSynced: new Date().toLocaleString(),
            }));
            setRefreshing(false);
        }, 1500);
    };

    //Popup handler
    const handleOpenPack = () => {
        setShowPack(true);

        // start slide + fade animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleClosePack = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start(() => setShowPack(false));
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ref={scrollRef}
            >
                {/* Last Synced & Refresh Control */}
                <Text style={styles.lastSynced}>
                    Last synced: {trainer.lastSynced}
                </Text>

                {/* Profile Image */}
                <Image source={{ uri: trainer.image }} style={styles.image} />
                <Text style={styles.name}>{trainer.name}</Text>

                {/* 🔵 Progress Bar for Steps → Next Point */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>
                        {trainer.allTimeSteps % stepsPerPoint} / {stepsPerPoint}{" "}
                        steps → Next Point
                    </Text>

                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFillSecondary,
                                {
                                    width: `${
                                        ((trainer.allTimeSteps %
                                            stepsPerPoint) /
                                            stepsPerPoint) *
                                        100
                                    }%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* 🟡 Progress Bar for Points → Next Pack */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>
                        {pointsIntoCurrentPack} / {packCost} points → Next Pack
                    </Text>

                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${pointProgress * 100}%` },
                            ]}
                        />
                    </View>

                    <Text style={styles.packsEarned}>
                        🎁 Packs Earned: {packsEarned}
                    </Text>
                </View>

                {/* "Open Pack" Button */}
                {packsEarned > 0 && (
                    <TouchableOpacity
                        style={styles.openPackButton}
                        onPress={handleOpenPack}
                    >
                        <Text style={styles.openPackText}>🎁 Open a Pack!</Text>
                    </TouchableOpacity>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                    <StatCard label="Cards" value={trainer.cardsCollected} />
                    <StatCard label="PokePoints" value={trainer.coins} />
                </View>
                <View style={styles.statsRow}>
                    <StatCard
                        label="All-Time Steps"
                        value={trainer.allTimeSteps}
                    />
                    <StatCard
                        label="Steps For Next Pack"
                        value={stepsRemaining}
                    />
                </View>
            </ScrollView>

            {/* 🪄 Animated Pack Overlay — moved OUTSIDE ScrollView */}
            {showPack && (
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <Animated.View
                        style={[
                            styles.packPopup,
                            {
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [400, 0], // slide up
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Image
                            source={{
                                uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
                            }}
                            style={styles.packImage}
                        />
                        <Text style={styles.packText}>
                            Your pack is ready to open! ✨
                        </Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClosePack}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    lastSynced: {
        marginTop: 30,
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 12,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    progressContainer: {
        width: "100%",
        marginBottom: 20,
    },
    progressLabel: {
        fontSize: 15,
        marginBottom: 6,
        color: "#333",
        textAlign: "center",
        fontWeight: "600",
    },
    progressBackground: {
        width: "100%",
        height: 14,
        borderRadius: 7,
        backgroundColor: "#ddd",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#FFCB05", // Pikachu yellow ⚡
    },
    progressFillSecondary: {
        height: "100%",
        backgroundColor: "#3B4CCA", // Pokémon blue 💙
    },
    packsEarned: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    openPackButton: {
        backgroundColor: "#3B4CCA", // Pikachu yellow
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
    },
    openPackText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    packImage: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        marginBottom: 8,
    },
    packText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    stepsRemaining: {
        marginTop: 4,
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    packPopup: {
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
        paddingVertical: 30,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    closeButton: {
        backgroundColor: "#3B4CCA",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 15,
    },
});
