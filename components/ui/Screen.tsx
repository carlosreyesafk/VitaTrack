import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, type ViewProps } from "react-native";
import { ClinicalMesh } from "./ClinicalMesh";

type Props = ViewProps & {
  scroll?: boolean;
  className?: string;
  withMesh?: boolean;
};

export function Screen({ children, scroll, className, withMesh = true, ...rest }: Props) {
  const inner = scroll ? (
    <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5">{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-surface ${className ?? ""}`} edges={["top", "left", "right"]} {...rest}>
      {withMesh && <ClinicalMesh />}
      {inner}
    </SafeAreaView>
  );
}
