export type ProductType = {
  name: string;
  description: string;
  value: string;
  quantity: number;
  isInstallments: string;
};
export interface UserPurchaseType {
  userID: number;
  numberParcelOfValue: string;
  total: string;
  numberOfCard: string;
  securityCode: string;
  cardName: string;
  userProductDataOfPurchase: UserProductDataOfPurchaseType;
  deliveryAddress: unknown;
  name: string;
  phone: string;
  address: string;
  complement: string;
  dueDate: string;
  numberAddress: string;
}

export interface UserProductDataOfPurchaseType {
  name: string;
  image: string;
  quantity: string | number;
  value: string;
}
