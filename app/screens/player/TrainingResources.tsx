import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Make sure useRouter is imported
import React from 'react';
import {
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const trainingResources = [
    {
        id: '1',
        title: 'Hockey Speed & Agility Drills',
        description: 'Improve your on-ice speed with dryland drills.',
        image: 'https://images.unsplash.com/photo-1605033241403-f86c79d7cd4b',
        type: 'video',
        link: 'https://www.youtube.com/watch?v=kUUJ3jJ9r2I',
    },
    {
        id: '2',
        title: 'Stickhandling 101',
        description: 'Develop silky mitts with these pro stickhandling techniques.',
        image: 'https://images.unsplash.com/photo-1601262499364-3f4b3ed9baf5',
        type: 'video',
        link: 'https://www.youtube.com/watch?v=ceTeZXUXvDs',
    },
    {
        id: '3',
        title: 'Strength Training Guide (PDF)',
        description: 'Full-body workout routines for hockey players.',
        image: 'https://images.unsplash.com/photo-1599058917212-dc69e1e6fa8b',
        type: 'pdf',
        link: 'https://www.dropbox.com/scl/fi/abc123/Hockey-Strength-Training.pdf?rlkey=xyz456&dl=1',
    },
    {
        id: '4',
        title: 'Mental Toughness Tips',
        description: 'Build your confidence and focus under pressure.',
        image: 'https://images.unsplash.com/photo-1534367610401-86d1a3a2e2dd',
        type: 'article',
        link: 'https://www.hockeycanada.ca/en-ca/news/mental-toughness-tips',
    },
];

export default function PlayerTrainingResources() {
    const router = useRouter();

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            Linking.openURL(url);
        } else {
            alert("Can't open this link: " + url);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            <LinearGradient
                colors={['#1B365D', '#3D7BE5']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Training Resources</Text>
                {/* MODIFIED LINE HERE */}
                <TouchableOpacity onPress={() => router.push('./Dashboard')} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Hockey Resources</Text>
            {trainingResources.map((resource) => (
                <TouchableOpacity key={resource.id} onPress={() => openLink(resource.link)} style={styles.card}>
                    <Image source={{ uri: resource.image }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{resource.title}</Text>
                        <Text style={styles.cardDesc}>{resource.description}</Text>
                        <View style={styles.tag}>
                            <Ionicons
                                name={
                                    resource.type === 'video'
                                        ? 'play-circle-outline'
                                        : resource.type === 'pdf'
                                            ? 'document-outline'
                                            : 'reader-outline'
                                }
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.tagText}>{resource.type.toUpperCase()}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F4F6F9',
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E5AAC',
        marginLeft: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A3A5A',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
    },
    tag: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#2E5AAC',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 6,
    },
});