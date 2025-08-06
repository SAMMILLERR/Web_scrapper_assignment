import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { URL } from 'url';

export function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSafeUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          try {
            const url = new URL(value);

            // Must be HTTPS
            if (url.protocol !== 'https:') return false;

            // Block localhost / loopback / private IP ranges
            const hostname = url.hostname;

            const isBlocked =
              hostname === 'localhost' ||
              hostname === '127.0.0.1' ||
              hostname.startsWith('192.168.') ||
              hostname.startsWith('10.') ||
              hostname.startsWith('172.');

            return !isBlocked;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'URL must be HTTPS and not point to a private/internal address';
        },
      },
    });
  };
}
