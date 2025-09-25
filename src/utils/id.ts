import { ulid } from 'ulidx';

export const createId: () => string = ulid as () => string;
