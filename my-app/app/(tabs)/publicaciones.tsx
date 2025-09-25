import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { PublicacionService } from '@/services/publicacionService';
import { SolicitudService } from '@/services/solicitudService';
import { Publicacion, Solicitud } from '@/types';

export default function PublicacionesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudesModalVisible, setSolicitudesModalVisible] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [cantidadSolicitud, setCantidadSolicitud] = useState('');


  const loadPublicaciones = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await PublicacionService.getPublicacionesWithDetails();
      
      // Filtrar solo las publicaciones del usuario actual
      const publicacionesDelUsuario = data.filter((publicacion: Publicacion) => {
        const tieneUsuarioValido = publicacion?.usuario?.id === user.id;
        const tieneStockValido = publicacion.stock && 
               typeof publicacion.stock.cantidadTotal === 'number' &&
               typeof publicacion.stock.cantidadDisponible === 'number' &&
               typeof publicacion.stock.cantidadReservada === 'number';

        return tieneUsuarioValido && tieneStockValido;
      });

      setPublicaciones(publicacionesDelUsuario);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al cargar publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadSolicitudesRecibidas = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await SolicitudService.getSolicitudesByUser(user.id);
      // Filtrar solicitudes donde el usuario actual es el dueño de la publicación
      const solicitudesParaMisPublicaciones = data.filter((solicitud: Solicitud) => 
        solicitud.publicacion?.usuario?.id === user.id && solicitud.usuario?.id !== user.id
      );
      setSolicitudesRecibidas(solicitudesParaMisPublicaciones);
    } catch (error: any) {
      console.error('Error al cargar solicitudes recibidas:', error);
    }
  }, [user]);

  useEffect(() => {
    loadPublicaciones();
    loadSolicitudesRecibidas();
  }, [loadPublicaciones, loadSolicitudesRecibidas]);



  const cancelarSolicitud = () => {
    setModalVisible(false);
    setSelectedPublicacion(null);
    setCantidadSolicitud('');
  };

  const handleEditarPublicacion = (publicacion: Publicacion) => {
    // Navegar a la página de edición con los datos de la publicación
    router.push({
      pathname: '/editar-publicacion',
      params: { 
        id: publicacion.id,
        titulo: publicacion.titulo,
        descripcion: publicacion.descripcion,
        cantidadTotal: publicacion.stock?.cantidadTotal || 0,
        imagenes: JSON.stringify(publicacion.imagenes || [])
      }
    });
  };

  const handleBorrarPublicacion = (publicacion: Publicacion) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la publicación "${publicacion.titulo}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await PublicacionService.deletePublicacion(publicacion.id);
              Alert.alert('Éxito', 'Publicación eliminada correctamente');
              loadPublicaciones(); // Recargar la lista
              loadSolicitudesRecibidas(); // Recargar solicitudes
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al eliminar la publicación');
            }
          },
        },
      ]
    );
  };

  const handleVerSolicitudes = (publicacion: Publicacion) => {
    setSelectedPublicacion(publicacion);
    setSolicitudesModalVisible(true);
  };

  const getSolicitudesParaPublicacion = (publicacionId: number) => {
    return solicitudesRecibidas.filter(solicitud => solicitud.publicacion?.id === publicacionId);
  };

  const handleResponderSolicitud = (solicitud: Solicitud, respuesta: 'aceptada' | 'rechazada') => {
    Alert.alert(
      'Confirmar respuesta',
      `¿Estás seguro de que quieres ${respuesta === 'aceptada' ? 'aceptar' : 'rechazar'} esta solicitud?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              if (respuesta === 'aceptada') {
                await SolicitudService.aceptarSolicitud(solicitud.id);
              } else if (respuesta === 'rechazada') {
                await SolicitudService.rechazarSolicitud(solicitud.id);
              }
              Alert.alert('Éxito', `Solicitud ${respuesta} correctamente`);
              loadSolicitudesRecibidas();
              loadPublicaciones();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Error al responder solicitud');
            }
          },
        },
      ]
    );
  };

  const confirmarSolicitud = async () => {
    if (!selectedPublicacion || !user) return;

    const cantidad = parseInt(cantidadSolicitud);
    if (!cantidad || cantidad <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida');
      return;
    }

    if (selectedPublicacion.stock && cantidad > selectedPublicacion.stock.cantidadDisponible) {
      Alert.alert('Error', 'La cantidad solicitada excede el stock disponible');
      return;
    }

    try {
      await SolicitudService.createSolicitud({
        cantidad: cantidad,
        id_usuario: user.id,
        id_publicacion: selectedPublicacion.id,
      });

      Alert.alert('Éxito', 'Solicitud creada correctamente');
      setModalVisible(false);
      loadPublicaciones(); // Recargar para actualizar stock
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear solicitud');
    }
  };

  const renderPublicacion = (publicacion: Publicacion) => {
    // Validación adicional antes de renderizar
    if (!publicacion?.usuario || !publicacion?.stock) {
      return null;
    }

    const solicitudesParaEstaPublicacion = getSolicitudesParaPublicacion(publicacion.id);

    return (
      <View key={publicacion.id} style={styles.card}>
        <Text style={styles.cardTitle}>{publicacion.titulo || 'Sin título'}</Text>
        <Text style={styles.cardDescription}>{publicacion.descripcion || 'Sin descripción'}</Text>
        
        {/* Imágenes de la publicación */}
        {publicacion.imagenes && publicacion.imagenes.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
              {publicacion.imagenes.map((imagen, index) => (
                <Image
                  key={imagen.id || index}
                  source={{ uri: imagen.url }}
                  style={styles.publicacionImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {publicacion.imagenes.length > 1 && (
              <Text style={styles.imageCount}>
                {publicacion.imagenes.length} imagen{publicacion.imagenes.length > 1 ? 'es' : ''}
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardDate}>
            Publicado: {publicacion.fecha ? new Date(publicacion.fecha).toLocaleDateString() : 'Fecha no disponible'}
          </Text>
        </View>

        <View style={styles.stockInfo}>
          <Text style={styles.stockText}>
            Disponible: {publicacion.stock?.cantidadDisponible || 0} / {publicacion.stock?.cantidadTotal || 0}
          </Text>
          <Text style={styles.stockReservado}>
            Reservado: {publicacion.stock?.cantidadReservada || 0}
          </Text>
        </View>

        {/* Mostrar número de solicitudes recibidas */}
        {solicitudesParaEstaPublicacion.length > 0 && (
          <View style={styles.solicitudesInfo}>
            <Text style={styles.solicitudesText}>
              📩 {solicitudesParaEstaPublicacion.length} solicitud{solicitudesParaEstaPublicacion.length > 1 ? 'es' : ''} recibida{solicitudesParaEstaPublicacion.length > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.verSolicitudesButton}
              onPress={() => handleVerSolicitudes(publicacion)}
            >
              <Text style={styles.verSolicitudesButtonText}>Ver Solicitudes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botones de acción para publicaciones propias */}
        <View style={styles.ownerActions}>
          <Text style={styles.ownerText}>Tu publicación</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditarPublicacion(publicacion)}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleBorrarPublicacion(publicacion)}
            >
              <Text style={styles.deleteButtonText}>🗑️ Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {
            loadPublicaciones();
            loadSolicitudesRecibidas();
          }} />
        }
      >
        {publicaciones.length > 0 ? (
          publicaciones.map(renderPublicacion)
        ) : (
          <Text style={styles.emptyText}>
            {isLoading ? 'Cargando publicaciones...' : 'No tienes publicaciones aún'}
          </Text>
        )}
      </ScrollView>

      {/* Modal para solicitar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelarSolicitud}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitar Material</Text>
            
            {selectedPublicacion && (
              <>
                <Text style={styles.modalSubtitle}>
                  {selectedPublicacion.titulo || 'Sin título'}
                </Text>
                <Text style={styles.modalInfo}>
                  Disponible: {selectedPublicacion.stock?.cantidadDisponible || 0}
                </Text>
              </>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Cantidad a solicitar"
              value={cantidadSolicitud}
              onChangeText={setCantidadSolicitud}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelarSolicitud}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmarSolicitud}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para ver solicitudes recibidas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={solicitudesModalVisible}
        onRequestClose={() => setSolicitudesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitudes Recibidas</Text>
            
            {selectedPublicacion && (
              <Text style={styles.modalSubtitle}>
                Para: {selectedPublicacion.titulo}
              </Text>
            )}

            <ScrollView style={styles.solicitudesContainer}>
              {selectedPublicacion && getSolicitudesParaPublicacion(selectedPublicacion.id).map((solicitud) => (
                <View key={solicitud.id} style={styles.solicitudCard}>
                  <View style={styles.solicitudHeader}>
                    <Text style={styles.solicitudUsuario}>
                      {solicitud.usuario?.nombre || 'N/A'} {solicitud.usuario?.apellido || ''}
                    </Text>
                    <Text style={styles.solicitudFecha}>
                      {solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString() : 'Fecha no disponible'}
                    </Text>
                  </View>
                  
                  <Text style={styles.solicitudCantidad}>
                    Cantidad solicitada: {solicitud.cantidadSolicitud}
                  </Text>
                  
                  <Text style={styles.solicitudEstado}>
                    Estado: {solicitud.estadoSolicitud?.descripcion || 'Estado desconocido'}
                  </Text>

                  {solicitud.estadoSolicitud?.descripcion?.toLowerCase() === 'pendiente' && (
                    <View style={styles.solicitudActions}>
                      <TouchableOpacity
                        style={[styles.solicitudButton, styles.aceptarButton]}
                        onPress={() => handleResponderSolicitud(solicitud, 'aceptada')}
                      >
                        <Text style={styles.aceptarButtonText}>✅ Aceptar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.solicitudButton, styles.rechazarButton]}
                        onPress={() => handleResponderSolicitud(solicitud, 'rechazada')}
                      >
                        <Text style={styles.rechazarButtonText}>❌ Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cerrarModalButton}
              onPress={() => setSolicitudesModalVisible(false)}
            >
              <Text style={styles.cerrarModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        {/* Botón flotante para crear publicación */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/crear-publicacion')}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
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
  marketplaceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  marketplaceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    fontStyle: 'italic',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  cardInfo: {
    marginBottom: 10,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  stockInfo: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  stockText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  stockReservado: {
    fontSize: 12,
    color: '#FF9800',
  },
  solicitarButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  solicitarButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ownerActions: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ownerText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  editButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 50,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    minHeight: 44, // Área de toque mínima recomendada
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 44, // Área de toque mínima recomendada
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  // Estilos para imágenes
  imageContainer: {
    marginVertical: 10,
  },
  imageScrollView: {
    marginBottom: 5,
  },
  publicacionImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  imageCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  // Estilos para solicitudes
  solicitudesInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  solicitudesText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  verSolicitudesButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  verSolicitudesButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Estilos para el modal de solicitudes
  solicitudesContainer: {
    maxHeight: 300,
    marginVertical: 10,
  },
  solicitudCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  solicitudUsuario: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  solicitudFecha: {
    fontSize: 12,
    color: '#666',
  },
  solicitudCantidad: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 4,
  },
  solicitudEstado: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  solicitudActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  solicitudButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  aceptarButton: {
    backgroundColor: '#28a745',
  },
  rechazarButton: {
    backgroundColor: '#dc3545',
  },
  aceptarButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rechazarButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cerrarModalButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cerrarModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});