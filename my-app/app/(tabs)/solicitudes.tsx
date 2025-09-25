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
import { EnvioService, Envio } from '@/services/envioService';
import { Solicitud } from '@/types';
import { EnvioModal } from '@/components/EnvioModal';

export default function SolicitudesScreen() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnvioModal, setShowEnvioModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [envios, setEnvios] = useState<{ [key: number]: Envio }>({});

  const loadSolicitudes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Cargar solicitudes básicas
      const solicitudesBasicas = await SolicitudService.getSolicitudesByPublicacionesDelUsuario(user.id);
      
      // Las solicitudes ya vienen enriquecidas desde el backend
      const solicitudesEnriquecidas = solicitudesBasicas.map(solicitud => ({
        ...solicitud,
        cantidadSolicitud: solicitud.cantidad,
        fechaSolicitud: solicitud.fecha
        // Los datos de usuario, publicación y estado ya vienen del backend
      }));
      
      setSolicitudes(solicitudesEnriquecidas);

      // Cargar información de envíos para solicitudes aceptadas
      const enviosData: { [key: number]: Envio } = {};
      for (const solicitud of solicitudesEnriquecidas) {
        if (solicitud.estadoSolicitud?.descripcion?.toLowerCase() === 'aceptada') {
          try {
            const envio = await EnvioService.getEnvioBySolicitudId(solicitud.id);
            if (envio) {
              enviosData[solicitud.id] = envio;
            }
          } catch {
            // Si no hay envío para esta solicitud, continuamos
            console.log(`No hay envío para la solicitud ${solicitud.id}`);
          }
        }
      }
      setEnvios(enviosData);
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

  const handleAceptarSolicitud = (solicitud: Solicitud) => {
    setSelectedSolicitudId(solicitud.id);
    setShowEnvioModal(true);
  };

  const handleRechazarSolicitud = (solicitud: Solicitud) => {
    Alert.alert(
      'Rechazar Solicitud',
      '¿Estás seguro de que quieres rechazar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, rechazar', 
          onPress: () => rechazarSolicitud(solicitud.id),
          style: 'destructive'
        },
      ]
    );
  };

  const aceptarSolicitud = async (solicitudId: number) => {
    try {
      await SolicitudService.aceptarSolicitud(solicitudId);
      Alert.alert('Éxito', 'Solicitud aceptada correctamente');
      loadSolicitudes();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al aceptar solicitud');
    }
  };

  const handleEnvioModalClose = () => {
    setShowEnvioModal(false);
    setSelectedSolicitudId(null);
  };

  const handleEnvioCreated = async (envioId: number) => {
    if (selectedSolicitudId) {
      await aceptarSolicitud(selectedSolicitudId);
    }
  };

  const rechazarSolicitud = async (solicitudId: number) => {
    try {
      await SolicitudService.rechazarSolicitud(solicitudId);
      Alert.alert('Éxito', 'Solicitud rechazada correctamente');
      loadSolicitudes();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al rechazar solicitud');
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

  const canPerformActions = (solicitud: Solicitud) => {
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
          <Text style={styles.infoLabel}>Solicitante: </Text>
          {solicitud.usuario?.nombre || 'N/A'} {solicitud.usuario?.apellido || ''}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Email: </Text>
          {solicitud.usuario?.email || 'Email no disponible'}
        </Text>
      </View>

      {/* Mostrar información de envío si la solicitud está aceptada */}
      {solicitud.estadoSolicitud?.descripcion?.toLowerCase() === 'aceptada' && envios[solicitud.id] && (
        <View style={styles.envioInfo}>
          <Text style={styles.envioTitle}>📦 Información de Envío</Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Dirección: </Text>
            {envios[solicitud.id].direccion}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Barrio: </Text>
            {envios[solicitud.id].barrio}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Localidad: </Text>
            {envios[solicitud.id].localidad}
          </Text>
        </View>
      )}

      {canPerformActions(solicitud) && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAceptarSolicitud(solicitud)}
          >
            <Text style={styles.acceptButtonText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRechazarSolicitud(solicitud)}
          >
            <Text style={styles.rejectButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitudes Recibidas</Text>
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
            <Text style={styles.emptyText}>No tienes solicitudes recibidas</Text>
            <Text style={styles.emptySubtext}>
              Cuando otros usuarios soliciten tus publicaciones, aparecerán aquí
            </Text>
          </View>
        )}
      </ScrollView>

      <EnvioModal
        visible={showEnvioModal}
        onClose={handleEnvioModalClose}
        solicitudId={selectedSolicitudId || 0}
        onEnvioCreated={handleEnvioCreated}
      />
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
  envioInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  envioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  rejectButtonText: {
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