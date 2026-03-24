import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, type PressableProps } from "react-native";

type Props = PressableProps & {
  title: string;
  className?: string;
};

export function GradientButton({ title, className, disabled, ...rest }: Props) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} {...rest}>
      <LinearGradient
        colors={disabled ? ["#9ca3af", "#9ca3af"] : ["#0058bc", "#0070eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          paddingVertical: 16,
          paddingHorizontal: 24,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <Text className={`text-center font-body text-base text-white ${className ?? ""}`}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
