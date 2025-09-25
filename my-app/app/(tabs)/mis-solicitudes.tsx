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

export default function MisSolicitudesScreen() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMisSolicitudes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Cargar solicitudes hechas por el usuario actual
      const misSolicitudes = await SolicitudService.getSolicitudesByUser(user.id);
      
      // Las solicitudes ya vienen enriquecidas desde el backend
      const solicitudesEnriquecidas = misSolicitudes.map(solicitud => ({
        ...solicitud,
        cantidadSolicitud: solicitud.cantidad,
        fechaSolicitud: solicitud.fecha
      }));
      
      setSolicitudes(solicitudesEnriquecidas);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar mis solicitudes');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMisSolicitudes();
    }
  }, [user, loadMisSolicitudes]);

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
      loadMisSolicitudes();
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
    if (!solicitud.estadoSolicitud || !solicitud.estadoSolicitud.descripcion) {
      return false;
    }
    const estado = solicitud.estadoSolicitud.descripcion.toLowerCase();
    return estado === 'pendiente';
  };

  const renderSolicitud = (solicitud: Solicitud) => (
    <View key={solicitud.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {solicitud.publicacion?.titulo || 'Título no disponible'}
        </Text>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: getEstadoColor(solicitud.estadoSolicitud?.descripcion || 'desconocido') }
        ]}>
          <Text style={styles.estadoText}>
            {solicitud.estadoSolicitud?.descripcion || 'Estado desconocido'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>
        {solicitud.publicacion?.descripcion || 'Descripción no disponible'}
      </Text>

      <View style={styles.solicitudInfo}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Cantidad solicitada: </Text>
          {solicitud.cantidadSolicitud}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Fecha de solicitud: </Text>
          {solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString() : 'Fecha no disponible'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Propietario: </Text>
          {solicitud.publicacion?.usuario?.nombre || 'Usuario no disponible'}
        </Text>
      </View>

      {canCancelSolicitud(solicitud) && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelarSolicitud(solicitud)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Debes iniciar sesión para ver tus solicitudes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Solicitudes</Text>
        <Text style={styles.subtitle}>Solicitudes que has hecho a otras donaciones</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadMisSolicitudes} />
        }
      >
        {solicitudes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Cargando...' : 'No has hecho solicitudes aún'}
            </Text>
          </View>
        ) : (
          solicitudes.map(renderSolicitud)
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
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  solicitudInfo: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});