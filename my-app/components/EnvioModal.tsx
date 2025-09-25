import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { EnvioService, CreateEnvioData } from '../services/envioService';

interface EnvioModalProps {
  visible: boolean;
  onClose: () => void;
  solicitudId: number;
  onEnvioCreated: (envioId: number) => void;
}

export const EnvioModal: React.FC<EnvioModalProps> = ({
  visible,
  onClose,
  solicitudId,
  onEnvioCreated,
}) => {
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateEnvio = async () => {
    if (!direccion.trim() || !barrio.trim() || !localidad.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const envioData: CreateEnvioData = {
        direccion: direccion.trim(),
        barrio: barrio.trim(),
        localidad: localidad.trim(),
        solicitudId,
      };

      const response = await EnvioService.createEnvio(envioData);
      Alert.alert('Éxito', 'Envío creado correctamente');
      onEnvioCreated(response.id);
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear envío');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDireccion('');
    setBarrio('');
    setLocalidad('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Información de Envío</Text>
            <Text style={styles.subtitle}>
              Ingresa la dirección donde se debe entregar el material
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección *</Text>
              <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Ej: Calle 123 #45-67"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Barrio *</Text>
              <TextInput
                style={styles.input}
                value={barrio}
                onChangeText={setBarrio}
                placeholder="Ej: Centro"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Localidad *</Text>
              <TextInput
                style={styles.input}
                value={localidad}
                onChangeText={setLocalidad}
                placeholder="Ej: Bogotá"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateEnvio}
                disabled={isLoading}
              >
                <Text style={styles.createButtonText}>
                  {isLoading ? 'Creando...' : 'Crear Envío'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});