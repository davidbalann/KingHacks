import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export const CATEGORIES = [
  {
    id: "meals",
    name: "Meal Programs",
    icon: "soup-kitchen",
    provider: "fa6",
  },
  {
    id: "washroom",
    name: "Washrooms & Showers",
    icon: "shower",
    provider: "fa6",
  },
  {
    id: "dropin",
    name: "Drop-in Centres",
    icon: "home-outline",
    provider: "ion",
  },
  {
    id: "health",
    name: "Health Services",
    icon: "medical-services",
    provider: "material",
  },
  {
    id: "warming",
    name: "Warming / Cooling Centres",
    icon: "flame-outline",
    provider: "ion",
  },
  {
    id: "shelter",
    name: "Shelters",
    icon: "person-shelter",
    provider: "fa6",
  },
  {
    id: "housing",
    name: "Housing Services",
    icon: "home-city-outline",
    provider: "material",
  },
  {
    id: "other",
    name: "Other Services",
    icon: "ellipsis-horizontal-circle-outline",
    provider: "ion",
  },
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
