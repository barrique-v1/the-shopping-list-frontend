import React, { useState } from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { View } from 'react-native';
import ListsIndex from '@/app/(tabs)/lists';
import RecipesIndex from '@/app/(tabs)/recipes';
import Profile from '@/app/(tabs)/profile';
import Header from '@/components/layout/Header';

const routes = [
    {
        key: 'lists',
        title: 'Meine Listen',
        focusedIcon: 'list-box',
        unfocusedIcon: 'list-box-outline',
    },
    {
        key: 'recipes',
        title: 'Meine Rezepte',
        focusedIcon: 'book-open-variant',
        unfocusedIcon: 'book-open-variant-outline',
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

    const handleCreateList = () => {
        console.log('Neue Liste erstellen');
    };

    const handleCreateRecipe = () => {
        console.log('Neue Rezept erstellen');
    };

    const getHeaderButton = () => {
        switch (routes[index]?.key) {
            case 'lists':
                return {
                    label: 'Neue Liste',
                    icon: 'plus',
                    onPress: () => {
                        handleCreateList();
                    },
                };
            case 'recipes':
                return {
                    label: 'Neues Rezept',
                    icon: 'book-plus',
                    onPress: () => {
                        handleCreateRecipe();
                    },
                };
            default:
                return undefined;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Header title={getCurrentTitle()} rightButton={getHeaderButton()} />

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
