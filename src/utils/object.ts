// Essa função faz a mesclagem de 2 objetos em um único objeto
// Se houver conflito de chaves, o valor do segundo objeto é priorizado

export function deepMerge(obj1: Record<any, any>, obj2: Record<any, any>) {
  const result = { ...obj1 }; // Copia o primeiro objeto

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      // Se a chave também está presente no obj1 e ambos são objetos, realiza a mesclagem recursiva
      if (
        typeof obj2[key] === 'object' &&
        obj2[key] !== null &&
        !Array.isArray(obj2[key]) &&
        typeof obj1[key] === 'object' &&
        obj1[key] !== null &&
        !Array.isArray(obj1[key])
      ) {
        result[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        // Caso contrário, usa o valor do obj2
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

/**
 * Recebe um valor e tenta convertê-lo para um objeto.
 * Se a conversão falhar, retorna null.
 * @param value Valor a ser convertido para objeto
 * @returns O objeto convertido ou null se a conversão falhar
 */
export function object(value: any): Record<string, any> | null {
  try {
    const obj: Record<string, any> = JSON.parse(
      JSON.stringify(value),
    ) as Record<string, any>;
    return obj;
  } catch (err) {
    return null; // Retorna null se a conversão falhar
  }
}

/**
 * Remove uma chave de um objeto mantendo a tipagem e sem acionar o problema do "O operando de um operador 'delete' precisa ser opcional.ts(2790)"
 * @param obj Objeto original
 * @param key Chave a ser removida
 * @returns Objeto sem a respectiva chave
 */
export function removeKey<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): Omit<T, K> {
  const { [key]: _, ...rest } = obj;
  return rest;
}
