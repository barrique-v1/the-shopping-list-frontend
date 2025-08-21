import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const theme = useTheme();

    return (
        <Appbar.Header
            style={{
                backgroundColor: theme.colors.surface,
            }}
        >
            <Appbar.Content
                title={title}
                titleStyle={theme.fonts.headlineMedium}
            />
        </Appbar.Header>
    );
}
