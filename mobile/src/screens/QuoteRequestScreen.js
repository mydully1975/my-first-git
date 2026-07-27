import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Picker,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { categoryAPI, quoteRequestAPI } from '../services/api';

const QuoteRequestScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    area: '',
    budget_min: '',
    budget_max: '',
    preferred_date: new Date(),
    special_requests: '',
  });

  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = ['급수', '주말 작업', '야간 작업', '자재 구입', '철거 포함', '설치 포함'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getTree();
      setCategories(response.categories);
    } catch (error) {
      Alert.alert('오류', '카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (!formData.category_id || !formData.title || !formData.description) {
      Alert.alert('오류', '필수 정보를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        category_id: parseInt(formData.category_id),
        title: formData.title,
        description: formData.description,
        requirements: {
          area: formData.area || undefined,
          options: selectedOptions.length > 0 ? selectedOptions : undefined,
          special_requests: formData.special_requests || undefined,
        },
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
        preferred_date: formData.preferred_date
          ? formData.preferred_date.toISOString().split('T')[0]
          : undefined,
      };

      const response = await quoteRequestAPI.create(requestData);
      Alert.alert('성공', '견적요청이 접수되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('MyQuotes'),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.response?.data?.error || '견적요청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, preferred_date: selectedDate });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>견적요청</Text>

      <Text style={styles.label}>카테고리 *</Text>
      <Picker
        selectedValue={formData.category_id}
        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        style={styles.picker}
      >
        <Picker.Item label="카테고리를 선택하세요" value="" />
        {categories.map((category) => (
          <Picker.Item
            key={category.id}
            label={category.name}
            value={category.id}
          />
        ))}
      </Picker>

      <Text style={styles.label}>제목 *</Text>
      <TextInput
        style={styles.input}
        placeholder="견적요청 제목"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <Text style={styles.label}>상세 설명 *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="서비스에 대한 상세 설명을 입력해주세요"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>면적 (㎡)</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 30"
        value={formData.area}
        onChangeText={(text) => setFormData({ ...formData, area: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>추가 옵션</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <View key={option} style={styles.optionItem}>
            <Text
              style={[
                styles.optionText,
                selectedOptions.includes(option) && styles.selectedOption,
              ]}
              onPress={() => handleOptionToggle(option)}
            >
              {selectedOptions.includes(option) ? '✓ ' : ''}
              {option}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>예산 범위 (원)</Text>
      <View style={styles.budgetContainer}>
        <TextInput
          style={[styles.input, styles.budgetInput]}
          placeholder="최소"
          value={formData.budget_min}
          onChangeText={(text) => setFormData({ ...formData, budget_min: text })}
          keyboardType="numeric"
        />
        <Text style={styles.budgetSeparator}>~</Text>
        <TextInput
          style={[styles.input, styles.budgetInput]}
          placeholder="최대"
          value={formData.budget_max}
          onChangeText={(text) => setFormData({ ...formData, budget_max: text })}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>희망 일정</Text>
      <Button
        title={formData.preferred_date.toLocaleDateString('ko-KR')}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={formData.preferred_date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>특수 요청사항</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="추가 요청사항이 있으면 입력해주세요"
        value={formData.special_requests}
        onChangeText={(text) => setFormData({ ...formData, special_requests: text })}
        multiline
        numberOfLines={3}
      />

      {submitting ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <Button title="견적요청 제출" onPress={handleSubmit} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionItem: {
    marginRight: 10,
    marginBottom: 5,
  },
  optionText: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    fontSize: 14,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    color: '#fff',
    borderColor: '#007AFF',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default QuoteRequestScreen;