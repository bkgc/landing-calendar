export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  bufferTime: number;
  staffIds: string[];
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
