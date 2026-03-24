import { View, type ViewProps } from "react-native";

type Props = ViewProps & { className?: string };

export function Card({ children, className, ...rest }: Props) {
  return (
    <View
      className={`rounded-3xl bg-white p-5 shadow-elevated border border-outline-variant/5 ${className ?? ""}`}
      style={{ shadowColor: "#2563eb", shadowOpacity: 0.08, shadowRadius: 30, shadowOffset: { width: 0, height: 15 } }}
      {...rest}
    >
      {children}
    </View>
  );
}
