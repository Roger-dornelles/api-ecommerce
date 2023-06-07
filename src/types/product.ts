export type ProductType = {
  name: string;
  description: string;
  value: string;
  quantity: number;
  isInstallments: string;
};
export interface UserPurchaseType {
  userID: number;
  name: string;
  numberParcelOfValue: string;
  total: string;
  numberOfCard: string;
  quantity: string;
  photosID: string;
  securityCode: string;
  cardName: string;
}
