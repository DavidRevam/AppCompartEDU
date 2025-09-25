import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PublicacionService } from '@/services/publicacionService';
import { SolicitudService } from '@/services/solicitudService';
import { Publicacion, Solicitud } from '@/types';

export default function PerfilScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [misPublicaciones, setMisPublicaciones] = useState<Publicacion[]>([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Cargar mis publicaciones
      const publicaciones = await PublicacionService.getPublicacionesByUser(user.id);
      setMisPublicaciones(publicaciones);

      // Cargar solicitudes recibidas en mis publicaciones
      const todasSolicitudes: Solicitud[] = [];
      for (const publicacion of publicaciones) {
        try {
          const solicitudes = await SolicitudService.getSolicitudesByPublicacion(publicacion.id);
          todasSolicitudes.push(...solicitudes);
        } catch (error) {
          // Continuar si hay error en una publicación específica
          console.error(`Error al cargar solicitudes para publicación ${publicacion.id}:`, error);
        }
      }
      setSolicitudesRecibidas(todasSolicitudes);

    } catch (error: any) {
      console.error('Error al cargar datos del perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleAceptarSolicitud = async (solicitudId: number) => {
    try {
      await SolicitudService.aceptarSolicitud(solicitudId);
      Alert.alert('Éxito', 'Solicitud aceptada correctamente');
      loadUserData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al aceptar solicitud');
    }
  };

  const handleRechazarSolicitud = async (solicitudId: number) => {
    try {
      await SolicitudService.rechazarSolicitud(solicitudId);
      Alert.alert('Éxito', 'Solicitud rechazada correctamente');
      loadUserData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al rechazar solicitud');
    }
  };

  const confirmarAccion = (accion: 'aceptar' | 'rechazar', solicitudId: number, titulo: string) => {
    const mensaje = accion === 'aceptar' 
      ? `¿Aceptar la solicitud para "${titulo}"?`
      : `¿Rechazar la solicitud para "${titulo}"?`;

    Alert.alert(
      'Confirmar acción',
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: accion === 'aceptar' ? 'Aceptar' : 'Rechazar',
          onPress: () => accion === 'aceptar' 
            ? handleAceptarSolicitud(solicitudId)
            : handleRechazarSolicitud(solicitudId)
        },
      ]
    );
  };

  const handleLogout = () => {
    console.log('🟡 PERFIL BOTÓN PRESIONADO: handleLogout ejecutado');
    
    if (Platform.OS === 'web') {
      // Para web, usar window.confirm
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (confirmed) {
        console.log('🟡 PERFIL CONFIRMAR WEB: Usuario confirmó el logout');
        logout();
      } else {
        console.log('🟡 PERFIL CANCELAR WEB: Usuario canceló el logout');
      }
    } else {
      // Para móviles, usar Alert.alert
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('🟡 PERFIL CANCELAR: Usuario canceló el logout')
          },
          { 
            text: 'Cerrar Sesión', 
            onPress: () => {
              console.log('🟡 PERFIL CONFIRMAR: Usuario confirmó el logout');
              logout();
            }
          },
        ]
      );
    }
  };

  const solicitudesPendientes = solicitudesRecibidas.filter(
    s => s.estadoSolicitud.descripcionEstado.toLowerCase() === 'pendiente'
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadUserData} />
      }
    >
      {/* Header del perfil */}
      <View style={styles.profileHeader}>
        <Text style={styles.userName}>
          {user?.nombre} {user?.apellido}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userPhone}>{user?.telefono}</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{misPublicaciones.length}</Text>
          <Text style={styles.statLabel}>Mis Publicaciones</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{solicitudesRecibidas.length}</Text>
          <Text style={styles.statLabel}>Solicitudes Recibidas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{solicitudesPendientes.length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
      </View>

      {/* Solicitudes pendientes */}
      {solicitudesPendientes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
          {solicitudesPendientes.map((solicitud) => (
            <View key={solicitud.id} style={styles.solicitudCard}>
              <Text style={styles.solicitudTitle}>
                {solicitud.publicacion.titulo}
              </Text>
              <Text style={styles.solicitudInfo}>
                  Solicitante: {solicitud.usuario.nombre} {solicitud.usuario.apellido}
                </Text>
              <Text style={styles.solicitudInfo}>
                Cantidad: {solicitud.cantidadSolicitud}
              </Text>
              <Text style={styles.solicitudInfo}>
                Fecha: {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
              </Text>

              <View style={styles.solicitudActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => confirmarAccion('aceptar', solicitud.id, solicitud.publicacion.titulo)}
                >
                  <Text style={styles.acceptButtonText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => confirmarAccion('rechazar', solicitud.id, solicitud.publicacion.titulo)}
                >
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Mis publicaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Publicaciones</Text>
        {misPublicaciones.length > 0 ? (
          misPublicaciones.map((publicacion) => (
            <View key={publicacion.id} style={styles.publicacionCard}>
              <Text style={styles.publicacionTitle}>{publicacion.titulo}</Text>
              <Text style={styles.publicacionDescription} numberOfLines={2}>
                {publicacion.descripcion}
              </Text>
              {publicacion.stock && (
                <Text style={styles.stockInfo}>
                  Stock: {publicacion.stock.cantidadDisponible} / {publicacion.stock.cantidadTotal}
                </Text>
              )}
              <Text style={styles.publicacionDate}>
                Publicado: {new Date(publicacion.fecha).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No tienes publicaciones</Text>
        )}
      </View>

      {/* Opciones */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.optionButton} onPress={refreshUser}>
          <Text style={styles.optionButtonText}>Actualizar Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  solicitudCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  solicitudTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  solicitudInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  solicitudActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  publicacionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  publicacionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  publicacionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stockInfo: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  publicacionDate: {
    fontSize: 12,
    color: '#999',
  },
  optionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
});