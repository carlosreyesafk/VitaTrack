import { View, type ViewProps } from "react-native";

type Props = ViewProps & { className?: string };

export function Card({ children, className, ...rest }: Props) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-cloud ${className ?? ""}`}
      style={{ shadowColor: "#1a1c1f", shadowOpacity: 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } }}
      {...rest}
    >
      {children}
    </View>
  );
}
