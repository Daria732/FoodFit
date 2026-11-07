import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Делаем SVG-окружность анимируемой
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Универсальное кольцо прогресса
export default function ProgressRing({
  size = 120,
  thickness = 10,
  percent = 0,
  color = '#5C9B78',
  trackColor = '#E8EDE9',
  value = '',
  label = '',
  sublabel = '',
  valueColor = '#24352B',
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Ограничиваем прогресс диапазоном 0–100%
  const safePercent = Math.min(100, Math.max(0, percent));

  // Начальное значение анимации
  const animatedValue = useRef(
    new Animated.Value(safePercent)
  ).current;

  // Плавно меняем заполнение кольца
  useEffect(() => {
    const animation = Animated.timing(animatedValue, {
      toValue: safePercent,
      duration: 650,
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [safePercent, animatedValue]);

  // Вычисляем смещение цветной дуги
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        {/* Фоновое кольцо */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />

        {/* Цветная дуга прогресса */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Текст в центре кольца */}
      <View style={styles.content}>
        <Text
          style={[
            styles.value,
            {
              color: valueColor,
              fontSize: size * 0.19,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>

        {label ? (
          <Text
            style={[
              styles.label,
              {
                color: valueColor,
                fontSize: size * 0.105,
              },
            ]}
          >
            {label}
          </Text>
        ) : null}

        {sublabel ? (
          <Text
            style={[
              styles.sublabel,
              {
                color: valueColor,
                fontSize: size * 0.085,
              },
            ]}
            numberOfLines={1}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  value: {
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 3,
  },
  sublabel: {
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.75,
  },
});