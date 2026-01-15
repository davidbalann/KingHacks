export type PlaceHours = {
  openNow: boolean;
  periods: {
    open: {
      day: number;
      hour: number;
      minute: number;
    };
    close?: {
      day: number;
      hour: number;
      minute: number;
    };
  }[];
  weekdayDescriptions: string[];
  nextOpenTime?: string;
  nextCloseTime?: string;
};

export type Place = {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  hours: PlaceHours | null;
  last_verified: string;
};
