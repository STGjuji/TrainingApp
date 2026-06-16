import { TextInput, View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.medium },
  label: { color: theme.colors.text, fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    color: theme.colors.text,
    fontSize: 16,
  },
  multilineInput: { paddingVertical: theme.spacing.medium, minHeight: 100, textAlignVertical: 'top' },
});
