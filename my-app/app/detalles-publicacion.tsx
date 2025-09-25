import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { PublicacionService } from '@/services/publicacionService';
import { Publicacion } from '@/types';

/**
 * LÓGICA DE STOCK SIMPLIFICADA:
 * 
 * 1. 🚫 Ocultar → estado = 0 (eliminado lógicamente) - No mostrar la publicación
 * 2. 🟢 "En Stock" → estado = 1 y cantidadDisponible > 0
 * 
 * REGLA IMPORTANTE: 
 * Cuando cantidadDisponible = 0, el backend debe automáticamente establecer estado = 0
 * No existe el estado "Sin Stock" visible para el usuario.
 */

export default function DetallesPublicacion() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicacionId = params.id as string;

  const loadPublicacionDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener la publicación con todos los detalles incluyendo stock
      const publicacionEncontrada = await PublicacionService.getPublicacionWithDetailsById(parseInt(publicacionId));
      
      if (publicacionEncontrada) {
        // Verificar si la publicación está eliminada lógicamente
        // NOTA: Cuando cantidadDisponible = 0, el backend debe automáticamente establecer estado = 0
        if (publicacionEncontrada.stock?.estado === 0) {
          setError('Esta publicación no está disponible');
          return;
        }
        setPublicacion(publicacionEncontrada);
      } else {
        setError('Publicación no encontrada');
      }
    } catch (error: any) {
      console.error('Error al cargar detalles:', error);
      setError('Error al cargar los detalles de la publicación');
    } finally {
      setIsLoading(false);
    }
  }, [publicacionId]);

  useEffect(() => {
    if (publicacionId) {
      loadPublicacionDetails();
    }
  }, [publicacionId, loadPublicacionDetails]);

  // Función para determinar el estado del stock (solo para publicaciones con stock)
  const getStockStatus = () => {
    if (!publicacion?.stock) {
      return {
        text: 'Sin información',
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
        textColor: '#6c757d'
      };
    }

    // Solo un estado: "En Stock" (si llegamos aquí, significa que estado = 1 y cantidadDisponible > 0)
    return {
      text: 'En Stock',
      color: '#28a745',
      backgroundColor: '#d4edda',
      textColor: '#155724'
    };
  };

  const handleSolicitar = () => {
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para hacer una solicitud');
      return;
    }

    if (!publicacion) return;

    // Por ahora solo mostrar un alert, la funcionalidad se implementará después
    Alert.alert(
      'Solicitud de Material',
      `¿Deseas solicitar "${publicacion.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solicitar', onPress: () => console.log('Solicitud enviada') }
      ]
    );
  };

  const handleVolver = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (error || !publicacion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Publicación no encontrada'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header con título */}
        <View style={styles.header}>
          <Text style={styles.title}>{publicacion.titulo}</Text>
        </View>

        {/* Imágenes */}
        {publicacion.imagenes && publicacion.imagenes.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {publicacion.imagenes.map((imagen, index) => (
                <Image
                  key={index}
                  source={{ uri: imagen.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <Text style={styles.imageCount}>
              {publicacion.imagenes.length} imagen{publicacion.imagenes.length > 1 ? 'es' : ''}
            </Text>
          </View>
        )}

        {/* Información del autor */}
        <View style={styles.authorSection}>
          <Text style={styles.sectionTitle}>Publicado por</Text>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>
              {publicacion.usuario?.nombre} {publicacion.usuario?.apellido}
            </Text>
            <Text style={styles.authorEmail}>{publicacion.usuario?.email}</Text>
            {publicacion.usuario?.telefono && (
              <Text style={styles.authorPhone}>📞 {publicacion.usuario.telefono}</Text>
            )}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{publicacion.descripcion}</Text>
        </View>

        {/* Información de stock */}
        {publicacion.stock && (
          <View style={styles.stockSection}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <View style={styles.stockInfo}>
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Total:</Text>
                <Text style={styles.stockValue}>{publicacion.stock.cantidadTotal}</Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Disponible:</Text>
                <Text style={[styles.stockValue, styles.stockAvailable]}>
                  {publicacion.stock.cantidadDisponible}
                </Text>
              </View>
              <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Reservado:</Text>
                <Text style={[styles.stockValue, styles.stockReserved]}>
                  {publicacion.stock.cantidadReservada}
                </Text>
              </View>
              <View style={styles.stockStatusRow}>
                <Text style={styles.stockLabel}>Estado:</Text>
                <View style={[
                  styles.stockStatusBadge,
                  { backgroundColor: getStockStatus().backgroundColor }
                ]}>
                  <Text style={[
                    styles.stockStatusText,
                    { color: getStockStatus().textColor }
                  ]}>
                    {getStockStatus().text}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Información adicional</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de publicación:</Text>
            <Text style={styles.infoValue}>
              {publicacion.fecha ? new Date(publicacion.fecha).toLocaleDateString() : 'No disponible'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>
              {publicacion.publicacion_activo ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
        </View>

        {/* Espaciado para los botones fijos */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Botones fijos en la parte inferior */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButtonFixed} onPress={handleVolver}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        
        {/* Solo mostrar botón solicitar si no es el propietario */}
        {user && publicacion.usuario?.id !== user.id && (
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleSolicitar}
          >
            <Text style={styles.requestButtonText}>
              Solicitar Publicación
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 15,
  },
  imageScroll: {
    paddingHorizontal: 15,
  },
  image: {
    width: 250,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  imageCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 10,
  },
  authorSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  authorInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  authorEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  authorPhone: {
    fontSize: 14,
    color: '#666',
  },
  descriptionSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  stockSection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  stockInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stockAvailable: {
    color: '#28a745',
  },
  stockReserved: {
    color: '#ffc107',
  },
  stockStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  stockStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  additionalInfo: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusActive: {
    color: '#28a745',
  },
  bottomSpacing: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonFixed: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 2,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});