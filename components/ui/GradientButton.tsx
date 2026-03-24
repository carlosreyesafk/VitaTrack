import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type Props = PressableProps & {
  title: string;
  className?: string;
  variant?: "primary" | "secondary";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GradientButton({ title, className, disabled, variant = "primary", ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => (scale.value = withSpring(0.96));
  const onPressOut = () => (scale.value = withSpring(1));

  if (variant === "secondary") {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          {
            borderRadius: 32,
            paddingVertical: 18,
            paddingHorizontal: 28,
            backgroundColor: "#f3f3f8",
            opacity: disabled ? 0.6 : 1,
            alignItems: "center",
            justifyContent: "center",
          },
          animatedStyle,
        ]}
        {...rest}
      >
        <Text
          className={`text-center font-headline text-lg text-on-surface ${className ?? ""}`}
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {title}
        </Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
      {...rest}
    >
      <LinearGradient
        colors={disabled ? ["#cbd5e1", "#e2e8f0"] : ["#0058bc", "#0070eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 48,
          paddingVertical: 20,
          paddingHorizontal: 28,
          opacity: disabled ? 0.6 : 1,
          shadowColor: "#0058bc",
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
      >
        <Text
          className={`text-center font-headline text-lg text-white ${className ?? ""}`}
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}
