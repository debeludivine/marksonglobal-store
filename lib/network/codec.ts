export type CompactProduct = {
  id: string;        // 8-char shortened hex mapping to UUID
  price: number;     // Integer in Kobo (e.g. 2500000 = ₦25,000.00)
  stock: number;     // Current stock integer
  category: number;  // 1-byte integer mapping to category Enum
};

/**
 * Encodes an array of products into a highly compressed, tiny string layout.
 * Format per product: id(8 chars):price(hex):stock(hex):cat(hex)|
 */
export function serializeProductStream(products: CompactProduct[]): string {
  return products
    .map(p => `${p.id}:${p.price.toString(36)}:${p.stock.toString(36)}:${p.category.toString(36)}`)
    .join('|');
}

/**
 * Decodes the ultra-lean string payload on the client side instantly.
 */
export function deserializeProductStream(stream: string): CompactProduct[] {
  if (!stream) return [];
  return stream.split('|').filter(Boolean).map(item => {
    const [id, priceHex, stockHex, catHex] = item.split(':');
    return {
      id,
      price: parseInt(priceHex, 36),
      stock: parseInt(stockHex, 36),
      category: parseInt(catHex, 36),
    };
  });
}
