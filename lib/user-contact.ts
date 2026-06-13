type SellerContact = {
  phone: string | null;
  showPhoneOnListings: boolean;
};

/** İlanlarda gösterilecek telefon — yalnızca satıcı açıkça izin verdiyse */
export function publicPhone(user: SellerContact): string | null {
  if (!user.showPhoneOnListings || !user.phone?.trim()) return null;
  return user.phone.trim();
}

export function stripPrivatePhone<T extends SellerContact>(user: T): Omit<T, "phone"> & { phone: string | null } {
  return { ...user, phone: publicPhone(user) };
}
