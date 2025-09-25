import { createHash } from 'crypto';

/**
 * Cria um hash a partir de uma entrada de texto
 *
 * Utilidade: Criar um hash de um "secret" e armazenar ou compartilhar pela aplicação
 * isso permite fazer buscas através do hash sem expor o secret real
 * @param str Entrada de texto
 */
export function hashString(str: string): string {
  return createHash('sha256') // pode ser "sha512" também
    .update(str)
    .digest('hex'); // ou "base64"
}

export function formatted(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function createSlug(text: string) {
  return text
    .normalize('NFD') // separa letras de acentos
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos
    .replace(/\s+/g, '_') // troca espaços por "_"
    .toLowerCase(); // deixa tudo em minúsculas
}

const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

function charToNum(c: string) {
  const i = ALPHABET.indexOf(c);
  if (i === -1) throw new Error(`Invalid character in orderKey: ${c}`);
  return i;
}

function numToChar(n: number) {
  return ALPHABET[n];
}

/**
 * Gera uma nova orderKey lexicográfica entre prev e next usando base-62
 */
export function generateOrderKey(
  prev: string | null,
  next: string | null,
): string {
  // Caso sem vizinhos
  if (!prev && !next) return 'U'; // valor do meio para começar

  // Helper: transforma string em array numérico
  const toNums = (s: string) => s.split('').map(charToNum);

  const prevNums = prev ? toNums(prev) : [];
  const nextNums = next ? toNums(next) : [];

  const result: number[] = [];
  let i = 0;

  while (true) {
    const a = prevNums[i] ?? 0; // menor possível se não existir
    const b = nextNums[i] ?? BASE - 1; // maior possível se não existir

    if (b - a > 1) {
      // espaço suficiente para inserir no meio
      result.push(Math.floor((a + b) / 2));
      break;
    } else {
      // espaço insuficiente, mantém a mesma posição e passa para o próximo dígito
      result.push(a);
      i++;
    }
  }

  return result.map(numToChar).join('');
}
