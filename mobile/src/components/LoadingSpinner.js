import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function LoadingSpinner({ size = 'large' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.brand[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.DEFAULT,
  },
});
