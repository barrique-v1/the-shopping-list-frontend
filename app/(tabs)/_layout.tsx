import React, {useState} from 'react';
import {Appbar, BottomNavigation, useTheme} from 'react-native-paper';
import {View} from 'react-native';
import ListsIndex from '@/app/(tabs)/lists';
import RecipesIndex from '@/app/(tabs)/recipes';
import Profile from '@/app/(tabs)/profile';

const routes = [
    {
        key: 'lists',
        title: 'Listen',
        focusedIcon: 'playlist-check',
        unfocusedIcon: 'playlist-check-outline',
    },
    {
        key: 'recipes',
        title: 'Rezepte',
        focusedIcon: 'book-open-variant',
        unfocusedIcon: 'book-open-outline',
    },
    {
        key: 'profile',
        title: 'Profil',
        focusedIcon: 'account',
        unfocusedIcon: 'account-outline',
    },
];

const renderScene = BottomNavigation.SceneMap({
    lists: ListsIndex,
    recipes: RecipesIndex,
    profile: Profile,
});

export default function TabLayout() {
    const theme = useTheme();
    const [index, setIndex] = useState(0);

    const getCurrentTitle = () => {
        return routes[index]?.title || 'App';
    };

    return (
        <View style={{flex: 1}}>
            <Appbar.Header
                style={{
                    backgroundColor: theme.colors.surface,
                }}
            >
                <Appbar.Content
                    title={getCurrentTitle()}
                    titleStyle={{
                        fontFamily: 'Antonio-SemiBold',
                        fontWeight: '600',
                        color: theme.colors.onSurface,
                    }}
                />
            </Appbar.Header>

            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
                barStyle={{
                    backgroundColor: theme.colors.surface,
                }}
            />
        </View>
    );
}