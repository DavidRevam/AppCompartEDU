import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('🏠 Index - Estado actual:', { isLoading, isAuthenticated });
    if (!isLoading) {
      console.log('⏱️ Index - Iniciando navegación...');
      // Usar setTimeout para asegurar que la navegación ocurra después del render
      setTimeout(() => {
        if (isAuthenticated) {
          console.log('🔐 Index - Usuario autenticado, navegando a tabs');
          router.replace('/(tabs)');
        } else {
          console.log('🔓 Index - Usuario no autenticado, navegando a login');
          router.replace('/(auth)/login');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});