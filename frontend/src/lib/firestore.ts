import { postJson, getJson } from "./functions";

export type PropertyInput = {
  title: string;
  type: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  description?: string;
};

export type PropertyRecord = PropertyInput & {
  id: number;
  createdAt: string;
};

export type ContactMessageInput = {
  name: string;
  email: string;
  message: string;
};

export const addProperty = async (input: PropertyInput): Promise<PropertyRecord> => {
  return postJson<PropertyInput, PropertyRecord>("/api/properties", input);
};

export const getProperties = async (): Promise<PropertyRecord[]> => {
  return getJson<PropertyRecord[]>("/api/properties");
};

export const addContactMessage = async (input: ContactMessageInput): Promise<void> => {
  await postJson<ContactMessageInput, void>("/api/contact", input);
};
