import { FontAwesome, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export const CATEGORIES = [
  { id: "restaurant", name: "Restaurants", icon: "restaurant-outline", provider: "ion" },
  { id: "bakery", name: "Bakeries", icon: "storefront-outline", provider: "ion" },
  { id: "charging", name: "Charging Station", icon: "battery-charging-outline", provider: "ion" },

  { id: "shelter", name: "Shelters", icon: "person-shelter", provider: "fa6" }, // FontAwesome6
  { id: "dropin", name: "Drop-in Centres", icon: "home-outline", provider: "ion" },
  { id: "meals", name: "Meal Programs", icon: "soup-kitchen", provider: "fa6" }, // FontAwesome6
  { id: "housing", name: "Housing Services", icon: "information-circle-outline", provider: "ion" },

  { id: "health", name: "Health Services", icon: "medical-services", provider: "material" }, // MaterialIcons
  { id: "warming", name: "Warm / Cool Sites", icon: "flame-outline", provider: "ion" },
  { id: "washroom", name: "Washroom / Shower", icon: "shower", provider: "fa6" }, // FontAwesome6
];

export const CategoryIcon = ({
  provider,
  name,
  size = 20,
  color = "#111",
}: {
  provider: "ion" | "fa6" | "material";
  name: string;
  size?: number;
  color?: string;
}) => {
  switch (provider) {
    case "fa6":
      return <FontAwesome name={name} size={size} color={color} />;
    case "material":
      return <MaterialIcons name={name} size={size} color={color} />;
    default:
      return <Ionicons name={name as any} size={size} color={color} />;
  }
};
