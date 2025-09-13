import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export default function VerificationScreen() {
  const navigation = useNavigation();
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: '1',
      title: 'Upload Passport',
      description: 'Take a clear photo of your passport information page',
      completed: false,
      required: true,
    },
    {
      id: '2',
      title: 'Upload Visa/Residence Permit',
      description: 'Upload your current visa or residence permit document',
      completed: false,
      required: true,
    },
    {
      id: '3',
      title: 'Upload Proof of Address',
      description: 'Upload a utility bill or bank statement with your Russian address',
      completed: false,
      required: true,
    },
    {
      id: '4',
      title: 'Add Emergency Contact',
      description: 'Provide contact information for an emergency contact person',
      completed: false,
      required: false,
    },
  ]);

  const handleUploadDocument = (stepId: string) => {
    Alert.alert(
      'Upload Document',
      'Choose how you want to upload your document',
      [
        { text: 'Camera', onPress: () => openCamera(stepId) },
        { text: 'Gallery', onPress: () => openGallery(stepId) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = (stepId: string) => {
    // Mock camera functionality
    Alert.alert('Camera', 'Camera functionality would open here');
    markStepCompleted(stepId);
  };

  const openGallery = (stepId: string) => {
    // Mock gallery functionality
    Alert.alert('Gallery', 'Gallery functionality would open here');
    markStepCompleted(stepId);
  };

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const handleSubmitVerification = () => {
    const requiredSteps = steps.filter(step => step.required);
    const completedRequiredSteps = requiredSteps.filter(step => step.completed);
    
    if (completedRequiredSteps.length === requiredSteps.length) {
      Alert.alert(
        'Verification Submitted',
        'Your verification documents have been submitted for review. You will receive a notification once the review is complete.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        'Incomplete Verification',
        'Please complete all required verification steps before submitting.'
      );
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const requiredSteps = steps.filter(step => step.required).length;
  const completedRequiredSteps = steps.filter(step => step.required && step.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Account Verification</Text>
          <Text style={styles.subtitle}>
            Verify your expat status to access all Ciuna features
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Verification Progress</Text>
            <Text style={styles.progressText}>
              {completedSteps} of {totalSteps} steps completed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedSteps / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Verification Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  {step.completed ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleContainer}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {step.required && (
                      <Text style={styles.requiredBadge}>Required</Text>
                    )}
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
              
              {!step.completed && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadDocument(step.id)}
                >
                  <Upload size={20} color="#3B82F6" />
                  <Text style={styles.uploadButtonText}>Upload Document</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Verification Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.benefitText}>Access to all marketplace features</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.benefitText}>Higher trust score and visibility</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.benefitText}>Access to exclusive deals and events</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              completedRequiredSteps < requiredSteps && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitVerification}
            disabled={completedRequiredSteps < requiredSteps}
          >
            <Text style={styles.submitButtonText}>
              {completedRequiredSteps < requiredSteps 
                ? `Complete ${requiredSteps - completedRequiredSteps} more required steps`
                : 'Submit for Verification'
              }
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Verification typically takes 1-2 business days
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  stepsContainer: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  submitNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
