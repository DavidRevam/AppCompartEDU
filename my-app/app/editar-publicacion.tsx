import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PublicacionService } from '@/services/publicacionService';

export default function EditarPublicacion() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const publicacionId = params.id as string;
  const [titulo, setTitulo] = useState(params.titulo as string || '');
  const [descripcion, setDescripcion] = useState(params.descripcion as string || '');
  const [cantidadTotal, setCantidadTotal] = useState(params.cantidadTotal as string || '');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validarUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.includes('unsplash.com') || url.includes('images.unsplash.com');
    } catch {
      return false;
    }
  };

  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) {
      Alert.alert('Error', 'Por favor ingresa una URL de imagen');
      return;
    }

    if (!validarUrl(nuevaImagenUrl)) {
      Alert.alert('Error', 'Por favor usa una URL válida de Unsplash');
      return;
    }

    if (imagenes.includes(nuevaImagenUrl)) {
      Alert.alert('Error', 'Esta imagen ya fue agregada');
      return;
    }

    setImagenes(prev => [...prev, nuevaImagenUrl]);
    setNuevaImagenUrl('');
  };

  const eliminarImagen = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (!titulo.trim() || !descripcion.trim() || !cantidadTotal.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const cantidad = parseInt(cantidadTotal);
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return;
    }

    setIsLoading(true);
    try {
      const publicacionData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        publicacion_activo: 1,
        cantidadTotal: cantidad
      };

      await PublicacionService.updatePublicacion(parseInt(publicacionId), publicacionData);
      Alert.alert('Éxito', 'Publicación actualizada correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar la publicación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar Publicación</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Título de la publicación"
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe el material que compartes"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cantidad Total *</Text>
          <TextInput
            style={styles.input}
            value={cantidadTotal}
            onChangeText={setCantidadTotal}
            placeholder="Cantidad disponible"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imágenes (Unsplash)</Text>
          <View style={styles.imageInputContainer}>
            <TextInput
              style={[styles.input, styles.imageInput]}
              value={nuevaImagenUrl}
              onChangeText={setNuevaImagenUrl}
              placeholder="https://images.unsplash.com/..."
            />
            <TouchableOpacity style={styles.addImageButton} onPress={agregarImagen}>
              <Text style={styles.addImageButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {imagenes.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.label}>Imágenes agregadas ({imagenes.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {imagenes.map((imagen, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: imagen }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => eliminarImagen(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleGuardar}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageInput: {
    flex: 1,
    marginRight: 10,
  },
  addImageButton: {
    backgroundColor: '#2196F3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});