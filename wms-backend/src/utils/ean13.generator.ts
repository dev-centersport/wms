import { Repository } from 'typeorm';
import { Localizacao } from '../localizacao/entities/localizacao.entity';

export class EAN13Generator {
  private static readonly MAX_ATTEMPTS = 5;

  static async generateUniqueEAN(
    armazemId: number,
    tipoId: number,
    repository: Repository<Localizacao>,
  ): Promise<string> {
    let attempts = 0;

    while (attempts < this.MAX_ATTEMPTS) {
      const ean = this.generateFromIds(armazemId, tipoId);

      // Verifica se o EAN já existe
      const exists = await repository.findOne({ where: { ean } });
      if (!exists) return ean;

      attempts++;
    }

    throw new Error(
      `Não foi possível gerar um EAN único após ${this.MAX_ATTEMPTS} tentativas`,
    );
  }

  static generateFromIds(armazem_id: number, tipo_id: number): string {
    // Formate os IDs para com os prefixos
    // dois digitos
    const armazemCodigo = (20 + (armazem_id % 10)).toString().padStart(2, '0');
    console.log(armazemCodigo);
    // dois
    const tipoCodigo = tipo_id.toString().padStart(2, '0');
    console.log(tipoCodigo);

    // Gera 9 dígitos aleatórios
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += Math.floor(Math.random() * 10);
    }
    console.log(randomPart);

    const partialEan = armazemCodigo + tipoCodigo + randomPart;
    console.log(partialEan);
    const checkDigit = this.calculateCheckDigit(partialEan);

    return partialEan + checkDigit;
  }

  public static calculateCheckDigit(partialEan: string): string {
    if (partialEan.length !== 12) {
      throw new Error('Partial EAN-13 tem que possuir 12 digitos');
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
