
import Map from "@/components/Map";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    AsyncStorage.clear();
  }, [])
  return (
    <>
      <Map/>
    </>
  );
}
