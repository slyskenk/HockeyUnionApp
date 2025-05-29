import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import SearchBar from '../../../components/SearchBar';
import { router } from 'expo-router';
import localNews from './news/news.json'; // ✅ import the JSON

type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: 'image' | 'video';
  timestamp: number;
};

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
};

const VideoCard = ({ item }: { item: NewsItem }) => {
  const videoId = getYouTubeId(item.videoUrl!);

  return (
    <View style={{ marginRight: 16, width: 260 }}>
      <YoutubePlayer
        height={140}
        width={260}
        videoId={videoId}
        play={false}
        webViewStyle={{ borderRadius: 10 }}
        onFullScreenChange={isFullscreen => console.log('Fullscreen:', isFullscreen)}
      />
      <Text style={styles.topNewsTitle}>{item.title}</Text>
    </View>
  );
};

const NewsScreen = () => {
  const [queryText, setQueryText] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocalNews = async () => {
      try {
        setNews(localNews as NewsItem[]); // ✅ cast JSON as NewsItem[]
      } catch (error) {
        console.error('Error loading local news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalNews();
  }, []);

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(queryText.toLowerCase())
  );

  const videoNews = filteredNews.filter(item => item.mediaType === 'video');
  const imageNews = filteredNews.filter(item => item.mediaType === 'image');

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const renderImageItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/news/article',
            params: {
              title: item.title,
              content: item.content,
              imageUrl: item.imageUrl,
            },
          })
        }
      >
        <Image source={{ uri: item.imageUrl! }} style={styles.cardImage} />
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          <Icon
            name={isBookmarked(item.id) ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={isBookmarked(item.id) ? '#003366' : '#555'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={imageNews}
        keyExtractor={item => item.id}
        renderItem={renderImageItem}
        ListHeaderComponent={
          <>
            <SearchBar query={queryText} onChangeText={setQueryText} profilePic={null} />
            <Text style={styles.sectionTitle}>Top Videos</Text>
            <View style={{ height: 40}} /> 
            <FlatList
              data={videoNews}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <VideoCard item={item} />}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <View style={{ height: 24 }} />
            <Text style={styles.sectionTitle}>News Articles</Text>
            <View style={{ height: 16 }} />
          </>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.floatingBookmark}
        onPress={() =>
          router.push({
            pathname: '/news/BookmarksScreen',
            params: { ids: JSON.stringify(bookmarkedIds) },
          })
        }
      >
        <Icon name="bookmark" size={38} color="#003366" />
      </TouchableOpacity>
    </View>
  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 16,
    marginTop: 16,
  },
  topNewsTitle: {
    width: 260,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    paddingRight: 8,
  },
  floatingBookmark: {
    position: 'absolute',
    top: 295,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
