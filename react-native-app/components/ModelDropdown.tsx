import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

type LabelItem = {
  label: string;
  value: string;
};

type Props = {
  title?: string;
  labels: LabelItem[];
  onChange?: (value: string) => void;
};

const ModelDropdown: React.FC<Props> = ({ title, labels, onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<LabelItem[]>(labels);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue = callback(value);
          setValue(() => newValue);
          if (onChange && newValue) {
            onChange(newValue);
          }
        }}
        setItems={setItems}
        placeholder="Select a model"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: { fontSize: 18, fontWeight: '600', marginBottom: 0 },
  dropdown: { borderColor: '#aaa',
              width: '75%',
            },
  dropdownContainer: { borderColor: '#aaa' },
});

export default ModelDropdown;
