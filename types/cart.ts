export interface License {
    _id: string;
    name: string;
    price: number;
    fileType: string;
    usageLimit: string;
    description: string;
  }
  
  export interface CartItemLicense {
    licenseId: string;
    price: number;
    _id: string;
  }
  
  export interface CartItem {
    compositionId: string;
    title: string;
    artist: string;
    genre: string;
    price: number;
    coverImage: string;
    licenses: CartItemLicense[];
    selectedLicenseId?: string;
  }