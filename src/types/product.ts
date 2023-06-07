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
  photosID: string;
  numberParcelOfValue: string;
  quantity: number;
  total: string;
  numberOfCard: string;
  lastNumbersOfCard: string;
  securityCode: number;
  cardName: string;
}
