import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Animated,
    TextInput,
    Modal,
    Pressable,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import StatCard from "../../components/statcard";

import {
    ensureSeed,
    getUser,
    updateUser,
    getSteps,
    addSteps,
    addToCollection,
} from "../../lib/storage";
import { openFromSet } from "../../lib/cards";

type Card = {
    id: string; // Pokémon TCG card ID (e.g. "sv3pt5-45")
    name: string; // Pokémon name
    image: string; // image URL (from API)
    message?: string; // optional description or message
};

const STORE_SETS = [
    // Adjust setId to match your dataset;
    {
        id: "sv3pt5",
        name: "Scarlet & Violet 151",
        logo: "https://images.pokemontcg.io/sv2a/logo.png",
        cost: 10,
    },
];

export default function ProfileScreen() {
    const [userName, setUserName] = useState("Ash Ketchum");
    const [coins, setCoins] = useState(1200);
    const [cardsCollected, setCardsCollected] = useState(0); // optional stat; not persisted here
    const [allTimeSteps, setAllTimeSteps] = useState(0);
    const [lastSynced, setLastSynced] = useState(new Date().toLocaleString());

    // steps input on profile
    const [stepInput, setStepInput] = useState("");

    // refresh
    const [refreshing, setRefreshing] = useState(false);

    // purchase modal
    const [showBuy, setShowBuy] = useState(false);
    const [selectedSet, setSelectedSet] = useState(STORE_SETS[0]);
    const [qty, setQty] = useState(1);
    const pullsPerPack = 5;
    const canDec = qty > 1;
    const canInc = qty < 10;

    const costSummary = useMemo(
        () => `${qty * selectedSet.cost} pts`,
        [qty, selectedSet]
    );

    const [points, setPoints] = useState(0);
    const [packsOpened, setPacksOpened] = useState(0);
    const [packsAvailable, setPacksAvailable] = useState(0);

    // Animated overlay for pack opening
    const [showPack, setShowPack] = useState(false);
    const [revealedCards, setRevealedCards] = useState<Card[]>([]);
    const [revealed, setRevealed] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(1)).current;
    const overlayFade = useRef(new Animated.Value(0)).current;
    const cardFade = useRef(new Animated.Value(1)).current;

    // -------- load local state on focus --------
    const loadLocal = useCallback(async () => {
        await ensureSeed();
        const u = await getUser();
        const s = await getSteps();
        if (u) {
            setUserName(u.name);
            setCoins(u.coins);
        }
        setAllTimeSteps(s);
        setLastSynced(new Date().toLocaleString());
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadLocal().catch((e) => console.warn("loadLocal failed:", e));
        }, [loadLocal])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadLocal()
            .catch(() => {})
            .finally(() => setRefreshing(false));
    };

    // -------- points math (from steps) --------
    const stepsPerPoint = 100; // 100 steps = 1 point
    const packCost = 100; // 100 points per pack
    const stepsPerPack = stepsPerPoint * packCost; // 10,000 steps = 1 pack

    const totalPoints = Math.floor(allTimeSteps / stepsPerPoint);
    const packsEarned = Math.floor(allTimeSteps / stepsPerPack);
    const stepsUsed = packsEarned * stepsPerPack;
    const stepsIntoCurrent = allTimeSteps - stepsUsed;
    const stepsRemaining = stepsPerPack - stepsIntoCurrent;
    const pointsIntoCurrentPack = totalPoints % packCost;
    const pointProgress = pointsIntoCurrentPack / packCost;

    // -------- actions --------
    const handleAddSteps = async () => {
        const n = Math.floor(Number(stepInput));
        if (!Number.isFinite(n) || n <= 0) {
            Alert.alert("Invalid steps", "Enter a positive number.");
            return;
        }

        const newPoints = Math.floor(n / 100);
        const nextSteps = await addSteps(n);

        setAllTimeSteps(nextSteps);
        setPoints((prev) => {
            const updatedPoints = prev + newPoints;
            setPacksAvailable(Math.floor(updatedPoints / 100)); // 👈 each 100 pts = 1 pack
            return updatedPoints;
        });
        setStepInput("");
        setLastSynced(new Date().toLocaleString());
    };

    const handleConfirmPurchase = async () => {
        try {
            const requiredPoints = qty * selectedSet.cost;
            if (points < requiredPoints) {
                Alert.alert(
                    "Not enough points",
                    "You need more points to open this pack!"
                );
                return;
            }

            const totalCards = qty * pullsPerPack;
            const pulls = openFromSet(selectedSet.id, totalCards);
            await addToCollection(pulls.map((c) => c.id));

            const updatedPoints = points - requiredPoints;
            setPoints(updatedPoints);
            setPacksOpened((prev) => prev + qty);
            setPacksAvailable(Math.floor(updatedPoints / 100)); // 👈 recalc remaining packs

            setRevealedCards(pulls);
            setShowBuy(false);
            setShowPack(true);

            Animated.parallel([
                Animated.timing(overlayFade, {
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
        } catch (e: any) {
            Alert.alert("Purchase failed", e.message || "Try again.");
        }
    };

    // -------- overlay animations --------
    const handleOpenPackOverlay = () => {
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
    const handleClosePackOverlay = () => {
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
        ]).start();
    };

    const handleOpenCard = () => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(cardAnim, {
                    toValue: 1.15,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(cardFade, {
                    toValue: 0.8,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(cardAnim, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(cardFade, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => setRevealed(true));
    };

    const handleClosePack = () => {
        Animated.parallel([
            Animated.timing(overlayFade, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowPack(false);
            setRevealed(false);
            cardAnim.setValue(1);
            cardFade.setValue(1);
            overlayFade.setValue(0);
            slideAnim.setValue(0);
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Last Synced */}
                <Text style={styles.lastSynced}>Last synced: {lastSynced}</Text>

                {/* Profile header */}
                <Image
                    source={{
                        uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/ash.png",
                    }}
                    style={styles.image}
                />
                <Text style={styles.name}>{userName}</Text>

                {/* 🔵 Steps → Next Point */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>
                        {allTimeSteps % stepsPerPoint} / {stepsPerPoint} steps →
                        Next Point
                    </Text>
                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFillSecondary,
                                {
                                    width: `${
                                        ((allTimeSteps % stepsPerPoint) /
                                            stepsPerPoint) *
                                        100
                                    }%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* 🟡 Points → Next Pack */}
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>
                        {points % packCost} / {packCost} points → Next Pack
                    </Text>
                    <View style={styles.progressBackground}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${
                                        ((points % packCost) / packCost) * 100
                                    }%`,
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* 🧮 Summary Info */}
                <View style={[styles.progressContainer, { marginTop: 10 }]}>
                    <Text style={styles.progressLabel}>
                        💰 Points: {points} | 🎁 Packs Available:{" "}
                        {packsAvailable}
                    </Text>
                    <Text
                        style={[
                            styles.packsEarned,
                            {
                                color: packsAvailable > 0 ? "#FFD700" : "#333", // gold if you have packs ready
                            },
                        ]}
                    >
                        📦 Packs Opened: {packsOpened}
                    </Text>
                </View>

                {/* ➕ Add steps (on Profile) */}
                <View style={styles.addStepsCard}>
                    <Text style={styles.addStepsTitle}>Add Steps</Text>
                    <View style={styles.addStepsRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 8888"
                            keyboardType="numeric"
                            value={stepInput}
                            onChangeText={setStepInput}
                        />
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={handleAddSteps}
                        >
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hint}>
                        Apple HealthKit integration coming soon!
                    </Text>
                </View>

                {/* Purchase/Open button → modal */}
                <TouchableOpacity
                    style={styles.openPackButton}
                    onPress={() => setShowBuy(true)}
                >
                    <Text style={styles.openPackText}>Open a Pack!</Text>
                </TouchableOpacity>

                {/* Stats */}
                {/* <View style={styles.statsRow}>
          <StatCard label="Cards" value={cardsCollected} />
          <StatCard label="PokePoints" value={coins} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="All-Time Steps" value={allTimeSteps} />
          <StatCard label="Steps For Next Pack" value={stepsRemaining} />
        </View> */}
            </ScrollView>

            {/* ----- Purchase Modal ----- */}
            <Modal
                visible={showBuy}
                transparent
                animationType="fade"
                onRequestClose={() => setShowBuy(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Purchase Pack</Text>

                        <View style={styles.packRow}>
                            {STORE_SETS.map((s) => {
                                const active = s.id === selectedSet.id;
                                return (
                                    <Pressable
                                        key={s.id}
                                        onPress={() => setSelectedSet(s)}
                                        style={[
                                            styles.chip,
                                            active && styles.chipActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                active && styles.chipTextActive,
                                            ]}
                                        >
                                            {s.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.stepperRow}>
                            <Pressable
                                style={[
                                    styles.stepperBtn,
                                    !canDec && styles.stepperDisabled,
                                ]}
                                onPress={() => canDec && setQty(qty - 1)}
                            >
                                <Text style={styles.stepperText}>−</Text>
                            </Pressable>
                            <Text style={styles.qtyLabel}>{qty}</Text>
                            <Pressable
                                style={[
                                    styles.stepperBtn,
                                    !canInc && styles.stepperDisabled,
                                ]}
                                onPress={() => canInc && setQty(qty + 1)}
                            >
                                <Text style={styles.stepperText}>+</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.modalCost}>
                            Total: {costSummary}
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                style={[styles.modalBtn, styles.modalCancel]}
                                onPress={() => setShowBuy(false)}
                            >
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtn, styles.modalConfirm]}
                                onPress={handleConfirmPurchase}
                            >
                                <Text
                                    style={[
                                        styles.modalBtnText,
                                        styles.modalConfirmText,
                                    ]}
                                >
                                    Purchase
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 🪄 Pack Opening Overlay */}
            {showPack && (
                <Animated.View
                    style={[styles.overlay, { opacity: overlayFade }]}
                    pointerEvents={showPack ? "auto" : "none"}
                >
                    <Animated.View
                        style={[
                            styles.packPopup,
                            {
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [400, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {!revealed ? (
                            <>
                                <Text style={styles.packText}>
                                    Tap to open your pack ✨
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleOpenCard}
                                >
                                    <Animated.View
                                        style={[
                                            styles.card,
                                            {
                                                transform: [
                                                    { scale: cardAnim },
                                                ],
                                                opacity: cardFade,
                                            },
                                        ]}
                                    >
                                        <Image
                                            source={{
                                                uri: "https://m.media-amazon.com/images/I/717kShcxzDL.jpg",
                                            }}
                                            style={styles.cardImage}
                                        />
                                        <Text style={styles.cardTitle}>
                                            Pokémon Pack
                                        </Text>
                                    </Animated.View>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.packText}>
                                    ✨ You opened:
                                </Text>
                                <ScrollView style={{ maxHeight: 280 }}>
                                    {revealedCards.map((c) => (
                                        <View
                                            key={c.id}
                                            style={styles.revealedRow}
                                        >
                                            <Image
                                                source={{ uri: c.image }}
                                                style={styles.revealedImage}
                                            />
                                            <Text style={styles.revealedText}>
                                                {c.name}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClosePack}
                                >
                                    <Text style={styles.closeButtonText}>
                                        Close
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </Animated.View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 24,
        backgroundColor: "#FFFFFF", // light pinky-white base
    },

    lastSynced: {
        marginTop: 24,
        fontSize: 12,
        color: "#888",
        fontStyle: "italic",
    },

    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: "#0cc0df", // aqua ring
    },

    name: {
        fontSize: 24,
        fontWeight: "800",
        color: "#333",
        marginBottom: 16,
    },

    // --- Progress Sections ---
    progressContainer: {
        width: "100%",
        marginBottom: 22,
        alignItems: "center",
    },
    progressLabel: {
        fontSize: 15,
        marginBottom: 6,
        color: "#444",
        textAlign: "center",
        fontWeight: "600",
    },
    progressBackground: {
        width: "90%",
        height: 14,
        borderRadius: 8,
        backgroundColor: "#eee",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#0cc0df", // aqua
        alignSelf: "flex-start",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        width: "0%", // 👈 fallback for initial render
    },
    progressFillSecondary: {
        height: "100%",
        backgroundColor: "#ff914d", // orange
        alignSelf: "flex-start",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        width: "0%", // 👈 fallback for initial render
    },
    packsEarned: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
        color: "#ff914d",
    },

    // --- Add Steps Card ---
    addStepsCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#ffd9e1", // soft pink edge
    },
    addStepsTitle: {
        fontSize: 17,
        fontWeight: "800",
        marginBottom: 10,
        color: "#333",
    },
    addStepsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: "#fef6f9",
        borderWidth: 1,
        borderColor: "#f4a6b8",
    },
    addBtn: {
        backgroundColor: "#ff914d",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnText: { color: "#fff", fontWeight: "800" },
    hint: { marginTop: 8, fontSize: 12, color: "#777" },

    // --- Open Pack Button ---
    openPackButton: {
        backgroundColor: "#0cc0df",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 24,
        shadowColor: "#0cc0df",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    openPackText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
        letterSpacing: 0.3,
    },

    // --- Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        borderColor: "#f9c5d1",
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: "800",
        marginBottom: 10,
        textAlign: "center",
        color: "#ff914d",
    },

    // Chips
    packRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
        justifyContent: "center",
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#fef6f9",
        borderWidth: 1,
        borderColor: "#f9c5d1",
    },
    chipActive: { backgroundColor: "#0cc0df" },
    chipText: { fontSize: 13, color: "#444", fontWeight: "600" },
    chipTextActive: { color: "#fff" },

    // Stepper
    stepperRow: {
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "center",
    },
    stepperBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#fff", // changed to white
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ddd", // subtle border for contrast
    },
    stepperDisabled: { opacity: 0.5 },
    stepperText: {
        fontSize: 22,
        fontWeight: "900",
        color: "#0cc0df", // aqua text color fits theme better
        lineHeight: 22,
    },
    qtyLabel: {
        minWidth: 28,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    modalCost: {
        textAlign: "center",
        fontSize: 14,
        color: "#777",
        marginBottom: 10,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    modalCancel: { backgroundColor: "#f9c5d1" },
    modalConfirm: { backgroundColor: "#ff914d" },
    modalBtnText: { fontWeight: "700", color: "#111827" },
    modalConfirmText: { color: "#fff" },

    // Overlay
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        paddingHorizontal: 20,
    },
    packPopup: {
        width: "90%",
        maxWidth: 420,
        backgroundColor: "#fff",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        maxHeight: "80%",
    },
    card: {
        width: 260,
        height: 380,
        backgroundColor: "#fff",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 3,
        borderColor: "#ff914d",
        overflow: "hidden",
    },
    cardImage: {
        width: 200,
        height: 280,
        resizeMode: "contain",
        borderRadius: 10,
        marginBottom: 10,
    },
    cardTitle: { fontWeight: "700", fontSize: 16, color: "#333" },
    packText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 10,
    },
    revealedRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
        gap: 10,
    },
    revealedImage: { width: 50, height: 50, borderRadius: 6 },
    revealedText: { fontSize: 16, fontWeight: "600", color: "#333" },
    closeButton: {
        backgroundColor: "#0cc0df",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    closeButtonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
