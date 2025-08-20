import {CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomNavigation, useTheme} from 'react-native-paper';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import ListsIndex from '@/app/(tabs)/lists';
import RecipesIndex from '@/app/(tabs)/recipes';
import Profile from '@/app/(tabs)/profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                animation: 'shift',
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: {
                    fontFamily: 'Antonio-SemiBold',
                    fontWeight: '600',
                    color: theme.colors.onSurface,
                },
            }}
            tabBar={({navigation, state, descriptors, insets}) => (
                <BottomNavigation.Bar
                    navigationState={state}
                    safeAreaInsets={insets}
                    onTabPress={({route, preventDefault}) => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (event.defaultPrevented) {
                            preventDefault();
                        } else {
                            navigation.dispatch({
                                ...CommonActions.navigate(route.name, route.params),
                                target: state.key,
                            });
                        }
                    }}
                    renderIcon={({route, focused, color}) =>
                        descriptors[route.key].options.tabBarIcon?.({
                            focused,
                            color,
                            size: 24,
                        }) || null
                    }
                    getLabelText={({route}) => {
                        const {options} = descriptors[route.key];
                        return typeof options.tabBarLabel === 'string'
                            ? options.tabBarLabel
                            : typeof options.title === 'string'
                                ? options.title
                                : route.name;
                    }}
                />
            )}
        >
            <Tab.Screen
                name="Listen"
                component={ListsIndex}
                options={{
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="format-list-bulleted" color={color} size={26}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Rezepte"
                component={RecipesIndex}
                options={{
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="book-open-variant" color={color} size={26}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Profil"
                component={Profile}
                options={{
                    tabBarIcon: ({color}) => (
                        <MaterialCommunityIcons name="account" color={color} size={26}/>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}