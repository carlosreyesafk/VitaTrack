import { Platform, View, type ViewProps } from "react-native";

type Props = ViewProps & { className?: string };

export function Card({ children, className, ...rest }: Props) {
  return (
    <View
      className={`rounded-3xl bg-white p-5 border border-outline-variant/10 ${className ?? ""}`}
      style={Platform.select({
        ios: {
          shadowColor: "#2563eb",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
        },
        android: {
          elevation: 4,
        },
        default: {
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOpacity: 1,
          shadowRadius: 10,
        }
      })}
      {...rest}
    >
      {children}
    </View>
  );
}
