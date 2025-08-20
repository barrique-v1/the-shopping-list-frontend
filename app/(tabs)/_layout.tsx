import {CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Appbar, BottomNavigation, useTheme} from 'react-native-paper';
import {MaterialDesignIcons} from  '@react-native-vector-icons/material-design-icons'
import {View} from 'react-native';
import ListsIndex from '@/app/(tabs)/lists';
import RecipesIndex from '@/app/(tabs)/recipes';
import Profile from '@/app/(tabs)/profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
    const theme = useTheme();

    return (
        <View style={{flex: 1}}>
            <Tab.Navigator
                screenOptions={({route}) => ({
                    header: () => (
                        <Appbar.Header
                            style={{
                                backgroundColor: theme.colors.surface,
                            }}
                        >
                            <Appbar.Content
                                title={route.name}
                                titleStyle={{
                                    fontFamily: 'Antonio-SemiBold',
                                    fontWeight: '600',
                                    color: theme.colors.onSurface,
                                }}
                            />
                        </Appbar.Header>
                    ),
                    headerShown: true,
                })}
                tabBar={({navigation, state, descriptors}) => (
                    <BottomNavigation.Bar
                        navigationState={state}
                        style={{
                            backgroundColor: theme.colors.surface,
                        }}
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
                            <MaterialDesignIcons name="playlist-check" color={color} size={24}/>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Rezepte"
                    component={RecipesIndex}
                    options={{
                        tabBarIcon: ({color}) => (
                            <MaterialDesignIcons name="book-open-variant" color={color} size={24}/>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profil"
                    component={Profile}
                    options={{
                        tabBarIcon: ({color}) => (
                            <MaterialDesignIcons name="account" color={color} size={24}/>
                        ),
                    }}
                />
            </Tab.Navigator>
        </View>
    );
}