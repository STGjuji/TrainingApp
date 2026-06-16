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
    paddingVertical: theme.spacing.small,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.small,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
