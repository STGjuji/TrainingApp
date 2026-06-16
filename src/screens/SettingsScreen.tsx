import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme';

export default function SettingsScreen() {
  const [message, setMessage] = useState('');

  async function pickGarminFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.type !== 'success') {
      setMessage('File selection cancelled.');
      return;
    }

    const fileUri = result.uri;
    const fileName = result.name;
    const fileType = result.mimeType ?? 'application/octet-stream';

    setMessage(`Uploading ${fileName}...`);

    try {
      const fileData = await fetch(fileUri);
      const fileBlob = await fileData.blob();
      const { error: uploadError } = await supabase.storage.from('garmin').upload(fileName, fileBlob, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        setMessage(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { error: insertError } = await supabase.from('garmin_imports').insert({
        file_name: fileName,
        file_type: fileType,
        storage_path: `garmin/${fileName}`,
      });

      if (insertError) {
        setMessage(`Database save failed: ${insertError.message}`);
        return;
      }

      setMessage('File uploaded successfully. Garmin parsing can be added next.');
    } catch (error) {
      setMessage(`Upload error: ${error}`);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <AppHeader title="Settings" subtitle="Upload Garmin data and configure your training app." />
        <Card>
          <Text style={styles.sectionTitle}>Garmin Import</Text>
          <Text style={styles.description}>Upload one Garmin file at a time to store your workout and health data.</Text>
          <PrimaryButton label="Upload Garmin File" onPress={pickGarminFile} />
        </Card>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.medium, paddingTop: theme.spacing.medium },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.small },
  description: { color: theme.colors.textMuted, marginBottom: theme.spacing.medium, lineHeight: 22 },
  message: { marginTop: theme.spacing.medium, color: theme.colors.text, fontSize: 15 },
});
