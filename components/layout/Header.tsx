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
                titleStyle={{
                    fontFamily: 'Antonio-SemiBold',
                    fontWeight: '600',
                    color: theme.colors.onSurface,
                }}
            />
        </Appbar.Header>
    );
}
