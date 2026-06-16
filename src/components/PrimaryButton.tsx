import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
}

export default function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.small + 2,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    marginHorizontal: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
