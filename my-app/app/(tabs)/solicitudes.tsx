import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { SolicitudService } from '@/services/solicitudService';
import { Solicitud } from '@/types';

export default function SolicitudesScreen() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSolicitudes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await SolicitudService.getSolicitudesByUser(user.id);
      setSolicitudes(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSolicitudes();
    }
  }, [user, loadSolicitudes]);

  const handleCancelarSolicitud = (solicitud: Solicitud) => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que quieres cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          onPress: () => cancelarSolicitud(solicitud.id),
          style: 'destructive'
        },
      ]
    );
  };

  const cancelarSolicitud = async (solicitudId: number) => {
    try {
      await SolicitudService.cancelarSolicitud(solicitudId);
      Alert.alert('Éxito', 'Solicitud cancelada correctamente');
      loadSolicitudes();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cancelar solicitud');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FF9800';
      case 'aceptada':
        return '#4CAF50';
      case 'rechazada':
        return '#f44336';
      case 'cancelada':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const canCancelSolicitud = (solicitud: Solicitud) => {
    const estado = solicitud.estadoSolicitud.descripcionEstado.toLowerCase();
    return estado === 'pendiente';
  };

  const renderSolicitud = (solicitud: Solicitud) => (
    <View key={solicitud.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {solicitud.publicacion.titulo}
        </Text>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(solicitud.estadoSolicitud.descripcionEstado) }
        ]}>
          <Text style={styles.estadoText}>
            {solicitud.estadoSolicitud.descripcionEstado}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>
        {solicitud.publicacion.descripcion}
      </Text>

      <View style={styles.solicitudInfo}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Cantidad solicitada: </Text>
          {solicitud.cantidadSolicitud}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Fecha de solicitud: </Text>
          {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Propietario: </Text>
          {solicitud.publicacion.usuario.id}
        </Text>
      </View>

      {canCancelSolicitud(solicitud) && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelarSolicitud(solicitud)}
        >
          <Text style={styles.cancelButtonText}>Cancelar Solicitud</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadSolicitudes} />
        }
      >
        {solicitudes.length > 0 ? (
          solicitudes.map(renderSolicitud)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes solicitudes</Text>
            <Text style={styles.emptySubtext}>
              Ve a la pestaña de Publicaciones para solicitar materiales
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  solicitudInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});