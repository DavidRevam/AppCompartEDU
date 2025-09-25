import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SolicitudService } from '@/services/solicitudService';
import { useAuth } from '@/contexts/AuthContext';

interface SolicitudModalProps {
  visible: boolean;
  onClose: () => void;
  publicacion: {
    id: number;
    titulo: string;
    cantidadDisponible: number;
  };
  onSuccess?: () => void;
}

export const SolicitudModal: React.FC<SolicitudModalProps> = ({
  visible,
  onClose,
  publicacion,
  onSuccess,
}) => {
  const [cantidad, setCantidad] = useState('1');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes estar autenticado para hacer una solicitud');
      return;
    }

    const cantidadNum = parseInt(cantidad);

    // Validaciones
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return;
    }

    if (cantidadNum > publicacion.cantidadDisponible) {
      Alert.alert(
        'Error',
        `No puedes solicitar más de ${publicacion.cantidadDisponible} unidades disponibles`
      );
      return;
    }

    setLoading(true);

    try {
      await SolicitudService.createSolicitud({
        cantidad: cantidadNum,
        id_usuario: user.id,
        id_publicacion: publicacion.id,
      });

      Alert.alert(
        'Éxito',
        'Tu solicitud ha sido enviada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              setCantidad('1');
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const incrementCantidad = () => {
    const current = parseInt(cantidad) || 0;
    if (current < publicacion.cantidadDisponible) {
      setCantidad((current + 1).toString());
    }
  };

  const decrementCantidad = () => {
    const current = parseInt(cantidad) || 0;
    if (current > 1) {
      setCantidad((current - 1).toString());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Solicitar Publicación</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.publicacionTitle}>{publicacion.titulo}</Text>
            <Text style={styles.disponibleText}>
              Disponible: {publicacion.cantidadDisponible} unidades
            </Text>

            {/* Cantidad Input */}
            <View style={styles.cantidadContainer}>
              <Text style={styles.label}>Cantidad a solicitar:</Text>
              <View style={styles.cantidadInputContainer}>
                <TouchableOpacity
                  onPress={decrementCantidad}
                  style={[
                    styles.cantidadButton,
                    parseInt(cantidad) <= 1 && styles.cantidadButtonDisabled,
                  ]}
                  disabled={parseInt(cantidad) <= 1}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>

                <TextInput
                  style={styles.cantidadInput}
                  value={cantidad}
                  onChangeText={setCantidad}
                  keyboardType="numeric"
                  textAlign="center"
                />

                <TouchableOpacity
                  onPress={incrementCantidad}
                  style={[
                    styles.cantidadButton,
                    parseInt(cantidad) >= publicacion.cantidadDisponible &&
                      styles.cantidadButtonDisabled,
                  ]}
                  disabled={parseInt(cantidad) >= publicacion.cantidadDisponible}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Validation Message */}
            {parseInt(cantidad) > publicacion.cantidadDisponible && (
              <Text style={styles.errorText}>
                No puedes solicitar más de {publicacion.cantidadDisponible} unidades
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                (loading || parseInt(cantidad) > publicacion.cantidadDisponible) &&
                  styles.submitButtonDisabled,
              ]}
              disabled={loading || parseInt(cantidad) > publicacion.cantidadDisponible}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  publicacionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  disponibleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  cantidadContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  cantidadInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantidadButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cantidadInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 80,
    height: 40,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});