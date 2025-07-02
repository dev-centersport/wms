// src/products/validators/ean13.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EAN13Generator } from '../../utils/ean13.generator';

@ValidatorConstraint({ name: 'IsEAN13Valid', async: false })
export class IsEAN13Valid implements ValidatorConstraintInterface {
  validate(ean13: string, _args: ValidationArguments) {
    return EAN13Generator.isValidEAN13(ean13);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'O EAN13 ($value) é válido';
  }
}
