import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import { COLORS } from '../constants/colors';

const ITEM_WIDTH = 62;

const getDateArray = () => {
  const dates = [];
  for (let i = -7; i <= 7; i++) {
    dates.push(moment().add(i, 'days'));
  }
  return dates;
};
interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}
const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onSelectDate }) => {
  const dates = useMemo(() => getDateArray(), []);
  const flatListRef = useRef(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dates}
        initialScrollIndex={7} // Start with today in the center
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        keyExtractor={(item) => item.format('YYYY-MM-DD')}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const isToday = item.isSame(moment(), 'day');
          const isSelected = item.format('YYYY-MM-DD') === selectedDate;

          return (
            <TouchableOpacity
              style={[
                styles.dateItem,
                isToday && styles.todayItem,
                isSelected && styles.selectedItem,
              ]}
              onPress={() => onSelectDate(item.format('YYYY-MM-DD'))}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {item.format('ddd')}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                {item.format('D')}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex:1,
    backgroundColor: 'transparent',
  },
  dateItem: {
    width: ITEM_WIDTH - 12,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayItem: {
    borderWidth: 1.7,
    borderColor: COLORS.primary,
  },
  selectedItem: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: COLORS.white,
  },
});

export default CalendarStrip;
