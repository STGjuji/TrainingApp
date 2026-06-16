import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { ReactNode } from 'react';

interface ModalFormProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function ModalForm({ visible, title, onClose, onSubmit, children }: ModalFormProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{children}</View>
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.submitBtn]} onPress={onSubmit}>
            <Text style={styles.submitText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.medium, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  closeBtn: { fontSize: 28, color: theme.colors.textMuted },
  content: { flex: 1, padding: theme.spacing.medium },
  footer: { flexDirection: 'row', gap: theme.spacing.medium, padding: theme.spacing.medium, borderTopWidth: 1, borderTopColor: theme.colors.border },
  button: { flex: 1, paddingVertical: theme.spacing.small + 2, borderRadius: theme.radius, alignItems: 'center' },
  cancelBtn: { backgroundColor: theme.colors.border },
  submitBtn: { backgroundColor: theme.colors.primary },
  cancelText: { color: theme.colors.textMuted, fontWeight: '700', fontSize: 16 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
