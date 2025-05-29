// components/SearchBar.tsx
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
    query: string;
    onChangeText: (text: string) => void;
    profilePic: string | null;
};

const SearchBar: React.FC<Props> = ({ query, onChangeText, profilePic }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const elevationAnim = useRef(new Animated.Value(2)).current;
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1.03,
                useNativeDriver: true,
            }),
            Animated.timing(elevationAnim, {
                toValue: 6,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(elevationAnim, {
                toValue: 2,
                duration: 150,
                useNativeDriver: false,
            }),
        ]).start();
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.searchBar,
                    {
                        transform: [{ scale: scaleAnim }],
                        elevation: elevationAnim,
                    },
                ]}
            >
                <Icon name="search" size={22} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for news..."
                    placeholderTextColor="#aaa"
                    value={query}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <TouchableOpacity onPress={() => {}}>
                    <Icon name="mic" size={22} color="#666" />
                </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => router.push('/profile/profile')}>
                <Image
                    source={
                        profilePic
                            ? { uri: profilePic }
                            : require('../assets/icons/avatar.jpg')
                    }
                    style={styles.profileImage}
                />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 8 : 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 8,
        fontSize: 16,
        color: '#333',
        height: Platform.OS === 'ios' ? 36 : 40,
    },
    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#ccc',
    },
});
