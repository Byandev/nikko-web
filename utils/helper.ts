import _ from 'lodash';

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  const maskedLocalPart = _.padEnd(localPart.slice(0, 2), localPart.length - 1, '*') + localPart.slice(-1);
  return `${maskedLocalPart}@${domain}`;
}