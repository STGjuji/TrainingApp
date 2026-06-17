import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.large,
    borderBottomWidth: 0,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.xlarge,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});
