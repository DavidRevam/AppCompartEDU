import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { PublicacionService } from '@/services/publicacionService';

export default function CrearPublicacionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cantidadTotal: '',
    cantidadDisponible: '', // Opcional - se calcula automáticamente si no se proporciona
  });

  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevaImagen, setNuevaImagen] = useState({ url: '' });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagenInputChange = (value: string) => {
    setNuevaImagen({ url: value });
  };

  const agregarImagen = () => {
    if (!nuevaImagen.url.trim()) {
      Alert.alert('Error', 'Por favor completa la URL de la imagen');
      return;
    }

    // Validar que la URL sea válida (básico)
    const urlPattern = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([/\w \.-]*)*\/?$/;
    if (!urlPattern.test(nuevaImagen.url)) {
      Alert.alert('Error', 'Por favor ingresa una URL válida');
      return;
    }

    setImagenes(prev => [...prev, nuevaImagen.url]);
    setNuevaImagen({ url: '' });
  };

  const eliminarImagen = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Validación de título (mínimo 3 caracteres según backend)
    if (!formData.titulo.trim() || formData.titulo.trim().length < 3) {
      Alert.alert('Error', 'El título debe tener al menos 3 caracteres');
      return false;
    }
    
    // Validación de descripción (mínimo 5 caracteres según backend)
    if (!formData.descripcion.trim() || formData.descripcion.trim().length < 5) {
      Alert.alert('Error', 'La descripción debe tener al menos 5 caracteres');
      return false;
    }
    
    // Validación de cantidad total (debe ser número positivo mayor a 0)
    if (!formData.cantidadTotal || isNaN(Number(formData.cantidadTotal)) || Number(formData.cantidadTotal) <= 0) {
      Alert.alert('Error', 'La cantidad total debe ser un número mayor a 0');
      return false;
    }
    
    // Validación de cantidad disponible (opcional, pero si se proporciona debe ser válida)
    if (formData.cantidadDisponible.trim() !== '') {
      const cantidadDisp = Number(formData.cantidadDisponible);
      if (isNaN(cantidadDisp) || cantidadDisp < 0) {
        Alert.alert('Error', 'La cantidad disponible debe ser un número mayor o igual a 0');
        return false;
      }
      if (cantidadDisp > Number(formData.cantidadTotal)) {
        Alert.alert('Error', 'La cantidad disponible no puede ser mayor a la cantidad total');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    try {
      setIsLoading(true);

      // Debug: Verificar token antes de la petición
      const { AuthService } = await import('@/services/authService');
      const token = await AuthService.getToken();
      console.log('Token disponible:', !!token);
      console.log('Usuario autenticado:', !!user);
      console.log('ID de usuario:', user.id);

      // Preparar datos según lo que espera el backend
      const publicacionData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        id_usuario: user.id,
        cantidadTotal: Number(formData.cantidadTotal),
        // Solo enviar cantidadDisponible si el usuario la especificó
        ...(formData.cantidadDisponible.trim() !== '' && {
          cantidadDisponible: Number(formData.cantidadDisponible)
        }),
        cantidadReservada: 0, // Siempre inicia en 0
        imagenes: imagenes // Enviar imágenes al backend
      };

      console.log('Datos a enviar:', publicacionData);
      console.log('Imágenes específicamente:', imagenes);
      console.log('Cantidad de imágenes:', imagenes.length);

      await PublicacionService.createPublicacion(publicacionData);

      Alert.alert(
        'Éxito',
        'Publicación creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error: any) {
      console.error('Error al crear publicación:', error);
      Alert.alert('Error', error.message || 'Error al crear la publicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      '¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', onPress: () => router.back() }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nueva Publicación</Text>
          <Text style={styles.subtitle}>Comparte materiales educativos con la comunidad</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.titulo}
              onChangeText={(value) => handleInputChange('titulo', value)}
              placeholder="Ej: Libros de Matemáticas 5to grado"
              maxLength={255}
            />
            <Text style={styles.helperText}>Mínimo 3 caracteres</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(value) => handleInputChange('descripcion', value)}
              placeholder="Describe los materiales que estás compartiendo..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.helperText}>Mínimo 5 caracteres</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad Total *</Text>
            <TextInput
              style={styles.input}
              value={formData.cantidadTotal}
              onChangeText={(value) => handleInputChange('cantidadTotal', value)}
              placeholder="Ej: 5"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.helperText}>¿Cuántas unidades tienes en total?</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad Disponible (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={formData.cantidadDisponible}
              onChangeText={(value) => handleInputChange('cantidadDisponible', value)}
              placeholder="Déjalo vacío para usar toda la cantidad total"
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.helperText}>
              Si no especificas, se usará toda la cantidad total como disponible
            </Text>
          </View>

          {/* Sección de Imágenes */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Imágenes (Opcional)</Text>
            
            {/* Formulario para agregar nueva imagen */}
            <View style={styles.addImageForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>URL de la imagen</Text>
                <TextInput
                  style={styles.input}
                  value={nuevaImagen.url}
                  onChangeText={handleImagenInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.addImageButton}
                onPress={agregarImagen}
              >
                <Text style={styles.addImageButtonText}>+ Agregar Imagen</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de imágenes agregadas */}
            {imagenes.length > 0 && (
              <View style={styles.imagesList}>
                <Text style={styles.imagesListTitle}>Imágenes agregadas ({imagenes.length})</Text>
                {imagenes.map((imagen, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image
                      source={{ uri: imagen }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageInfo}>
                      <Text style={styles.imageUrl} numberOfLines={1}>{imagen}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => eliminarImagen(index)}
                    >
                      <Text style={styles.removeImageButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Los campos marcados con * son obligatorios. La cantidad disponible se calcula automáticamente si no la especificas.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creando...' : 'Crear Publicación'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // Estilos para la sección de imágenes
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addImageForm: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  addImageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addImageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  imagesList: {
    marginTop: 10,
  },
  imagesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imageItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  imageInfo: {
    flex: 1,
    marginRight: 10,
  },
  imageUrl: {
    fontSize: 12,
    color: '#666',
  },
  removeImageButton: {
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});