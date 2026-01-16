# Map GeoJSON TYPE values -> UI category ids
# Unknowns must be returned as "other" per your decision.

TYPE_TO_CATEGORY = {
    # Meals / food
    "Meal Program": "meals",
    "Food Bank": "meals",

    # Shelters
    "Emergency Shelter": "shelter",
    "Family Shelter": "shelter",
    "Youth Shelter": "shelter",
    "Seasonal Shelter": "shelter",

    # Drop-in / outreach
    "Drop-In Centre": "dropin",
    "Street Outreach": "other",  # you can change to "dropin" later if you want

    # Housing
    "Housing Services": "housing",

    # Health
    "Health Service": "health",

    # Warming / cooling
    "Warm Up / Cool Down Location": "warming",

    # Washroom / shower
    "Washroom": "washroom",
    "Shower": "washroom",

    # Other
    "Clothing": "other",
}

def map_type_to_category(raw_type: str | None) -> str:
    if not raw_type:
        return "other"
    return TYPE_TO_CATEGORY.get(raw_type.strip(), "other")
