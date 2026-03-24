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
        colors={disabled ? ["#cbd5e1", "#e2e8f0"] : ["#2563eb", "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          paddingVertical: 18,
          paddingHorizontal: 28,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text
          className={`text-center font-body text-base text-white ${className ?? ""}`}
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
