import { View, Text, Button, Image } from "react-native";
import React, { useEffect } from "react";
import { useRouter, usePathname, useSegments } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";

const index = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // console.log("[index] pathname:", pathname);
    // console.log("[index] segments:", segments);
  }, [pathname, segments]);

  return (
    <ScreenWrapper>
      <Text>index</Text>

      {/* quick diagnostics */}
      <Text>pathname: {pathname}</Text>
      <Text>segments: {JSON.stringify(segments)}</Text>

      <Button title="welcome" onPress={() => router.push("/welcome")} />
    </ScreenWrapper>
  );
}

export default index