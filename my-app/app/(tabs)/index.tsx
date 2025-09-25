import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Modal,
  TextInput,
  Image,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { PublicacionService } from '@/services/publicacionService';
import { SolicitudService } from '@/services/solicitudService';
import { Publicacion } from '@/types';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState<Publicacion | null>(null);
  const [cantidadSolicitud, setCantidadSolicitud] = useState('');

  const loadPublicaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Cargar todas las publicaciones
      const publicacionesData = await PublicacionService.getPublicacionesWithDetails();
      
      // Filtrar para mostrar solo publicaciones de otros usuarios
      const publicacionesDeOtros = publicacionesData.filter(pub => {
        return pub.usuario && pub.usuario.id !== user?.id;
      });
      
      setPublicaciones(publicacionesDeOtros);
    } catch (error: any) {
      console.error('Error al cargar publicaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPublicaciones();
  }, [loadPublicaciones]);

  const handleSolicitar = (publicacion: Publicacion) => {
    setSelectedPublicacion(publicacion);
    setCantidadSolicitud('');
    setModalVisible(true);
  };

  const handleConfirmarSolicitud = async () => {
    if (!selectedPublicacion || !user) {
      Alert.alert('Error', 'Datos incompletos');
      return;
    }

    const cantidad = parseInt(cantidadSolicitud);
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    if (cantidad > (selectedPublicacion.stock?.cantidadDisponible || 0)) {
      Alert.alert('Error', 'La cantidad solicitada excede el stock disponible');
      return;
    }

    try {
      await SolicitudService.createSolicitud({
        id_publicacion: selectedPublicacion.id,
        cantidad: cantidad,
        id_usuario: user.id,
      });

      Alert.alert('Éxito', 'Solicitud enviada correctamente');
      setModalVisible(false);
      loadPublicaciones(); // Recargar para actualizar el stock
    } catch (error: any) {
      console.error('Error al crear solicitud:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  const handleVerDetalles = (publicacion: Publicacion) => {
    router.push(`/detalles-publicacion?id=${publicacion.id}`);
  };

  const handleLogout = () => {
    console.log('🔴 BOTÓN PRESIONADO: handleLogout ejecutado');
    
    if (Platform.OS === 'web') {
      // Para web, usar window.confirm
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (confirmed) {
        console.log('🔴 CONFIRMAR WEB: Usuario confirmó el logout');
        logout();
      } else {
        console.log('🔴 CANCELAR WEB: Usuario canceló el logout');
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
            onPress: () => console.log('🔴 CANCELAR: Usuario canceló el logout'),
          },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: () => {
              console.log('🔴 CONFIRMAR: Usuario confirmó el logout');
              logout();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadPublicaciones} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>¡Hola!</Text>
            <Text style={styles.userName}>
              {user?.nombre} {user?.apellido}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publicaciones Disponibles</Text>
          
          {/* DEBUG INFO */}
          <View style={{backgroundColor: '#f0f0f0', padding: 10, marginBottom: 10, borderRadius: 5}}>
            <Text style={{fontSize: 12, color: '#666'}}>
              🔍 DEBUG: Usuario actual ID: {user?.id}
            </Text>
            <Text style={{fontSize: 12, color: '#666'}}>
              🔍 DEBUG: Usuario nombre: {user?.nombre} {user?.apellido}
            </Text>
            <Text style={{fontSize: 12, color: '#666'}}>
              🔍 DEBUG: Total publicaciones filtradas: {publicaciones.length}
            </Text>
            <Text style={{fontSize: 12, color: '#666'}}>
              🔍 DEBUG: Loading: {isLoading ? 'Sí' : 'No'}
            </Text>
          </View>
          
          {publicaciones.length > 0 ? (
            publicaciones.map((publicacion) => (
              <View key={publicacion.id} style={styles.card}>
                {publicacion.imagenes && publicacion.imagenes.length > 0 && (
                  <Image 
                    source={{ uri: publicacion.imagenes[0].url }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{publicacion.titulo}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {publicacion.descripcion}
                  </Text>
                  <Text style={styles.cardAuthor}>
                    Por: {publicacion.usuario?.nombre || 'Usuario'} {publicacion.usuario?.apellido || ''}
                  </Text>
                  {publicacion.stock && (
                    <Text style={styles.cardStock}>
                      Disponible: {publicacion.stock.cantidadDisponible}
                    </Text>
                  )}
                  
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      onPress={() => handleVerDetalles(publicacion)}
                    >
                      <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.requestButton,
                        (!publicacion.stock || publicacion.stock.cantidadDisponible <= 0) && styles.disabledButton
                      ]}
                      onPress={() => handleSolicitar(publicacion)}
                      disabled={!publicacion.stock || publicacion.stock.cantidadDisponible <= 0}
                    >
                      <Text style={styles.requestButtonText}>
                        {(!publicacion.stock || publicacion.stock.cantidadDisponible <= 0) ? 'Sin Stock' : 'Solicitar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay publicaciones disponibles</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal para solicitar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitar Publicación</Text>
            
            {selectedPublicacion && (
              <>
                <Text style={styles.modalSubtitle}>{selectedPublicacion.titulo}</Text>
                <Text style={styles.modalInfo}>
                  Stock disponible: {selectedPublicacion.stock?.cantidadDisponible || 0}
                </Text>
                
                <Text style={styles.inputLabel}>Cantidad a solicitar:</Text>
                <TextInput
                  style={styles.input}
                  value={cantidadSolicitud}
                  onChangeText={setCantidadSolicitud}
                  placeholder="Ingresa la cantidad"
                  keyboardType="numeric"
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleConfirmarSolicitud}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
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
    marginBottom: 8,
    lineHeight: 20,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 5,
  },
  cardStock: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  modalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
