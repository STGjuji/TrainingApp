import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
