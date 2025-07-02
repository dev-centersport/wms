export class EAN13Generator {
  static generateRandomEAN13(): string {
    // Garante que todos os dígitos sejam strings
    const systemDigit = String(Math.floor(Math.random() * 10));

    let partialEan = systemDigit;
    for (let i = 0; i < 11; i++) {
      partialEan += String(Math.floor(Math.random() * 10));
    }

    const checkDigit = this.calculateCheckDigit(partialEan);
    const fullEan = partialEan + checkDigit;

    // Garante que o retorno seja string com 13 caracteres
    return String(fullEan).padStart(13, '0');
  }

  public static calculateCheckDigit(partialEan: string): string {
    if (partialEan.length !== 12) {
      throw new Error('Partial EAN-13 must be 12 digits');
    }

    let sum = 0;
    for (let i = 0; i < partialEan.length; i++) {
      const digit = parseInt(partialEan[i], 10);
      // CORREÇÃO: Posições ímpares (1, 3, 5...) multiplicam por 1
      // Posições pares (2, 4, 6...) multiplicam por 3
      sum += digit * (i % 2 === 0 ? 1 : 3); // Antes estava invertido
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  static isValidEAN13(ean13: string): boolean {
    if (typeof ean13 !== 'string') return false;
    return (
      ean13.length === 13 &&
      /^\d+$/.test(ean13) &&
      this.calculateCheckDigit(ean13.substring(0, 12)) === ean13[12]
    );
  }
}
