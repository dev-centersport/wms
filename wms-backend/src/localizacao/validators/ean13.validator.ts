import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEAN13Valid', async: false })
export class IsEAN13Valid implements ValidatorConstraintInterface {
  validate(ean: string) {
    if (!ean || ean.length !== 13 || !/^\d+$/.test(ean)) {
      return false;
    }

    // Cálculo do dígito verificador do EAN-13
    const digits = ean.split('').map(Number);
    const checksum = digits
      .slice(0, 12)
      .reduce(
        (sum, digit, index) => sum + digit * (index % 2 === 0 ? 1 : 3),
        0,
      );

    const checkDigit = (10 - (checksum % 10)) % 10;

    return digits[12] === checkDigit;
  }

  defaultMessage(args: ValidationArguments) {
    return `EAN-13 inválido: o código '${args.value}' não possui um dígito verificador válido.`;
  }
}
