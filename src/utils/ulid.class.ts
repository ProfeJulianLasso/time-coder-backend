/**
 * Clase para el manejo y validación de identificadores ULID.
 * ULID: Universally Unique Lexicographically Sortable Identifier
 * Formato: 26 caracteres, CrockfordBase32 (mayúsculas excepto ILOU)
 */
export class ULID {
  private readonly value: string;

  // Caracteres válidos en base32 (CrockfordBase32)
  private static readonly VALID_CHARS =
    /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

  /**
   * Constructor que acepta un string ULID y lo valida
   * @param ulid - String ULID a validar
   * @throws Error si el ULID no es válido
   */
  constructor(ulid: string) {
    if (!ULID.isValid(ulid)) {
      throw new Error(
        'ULID inválido: debe ser una cadena de 26 caracteres en base32',
      );
    }
    this.value = ulid;
  }

  /**
   * Método estático para validar si un string es un ULID válido
   * @param ulid - String a validar
   * @returns true si es un ULID válido, false en caso contrario
   */
  public static isValid(ulid: string): boolean {
    if (!ulid || typeof ulid !== 'string') {
      return false;
    }

    return ULID.VALID_CHARS.test(ulid);
  }

  /**
   * Genera un nuevo ULID
   * @returns Una nueva instancia de ULID
   */
  public static generate(): ULID {
    const timestamp = ULID.generateTimestampPart();
    const randomness = ULID.generateRandomPart();
    return new ULID(timestamp + randomness);
  }

  /**
   * Genera la parte del timestamp (primeros 10 caracteres)
   * @returns String de 10 caracteres representando el timestamp
   */
  private static generateTimestampPart(): string {
    const timestamp = Date.now();
    const timeChars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let result = '';

    // Convertimos el timestamp a base32 (10 caracteres)
    let timeMs = timestamp;
    for (let i = 9; i >= 0; i--) {
      const mod = timeMs % 32;
      result = timeChars.charAt(mod) + result;
      timeMs = Math.floor(timeMs / 32);
    }

    return result;
  }

  /**
   * Genera la parte aleatoria (16 caracteres finales)
   * @returns String aleatorio de 16 caracteres
   */
  private static generateRandomPart(): string {
    const randomChars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let result = '';

    // Generamos 16 caracteres aleatorios
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * 32);
      result += randomChars.charAt(randomIndex);
    }

    return result;
  }

  /**
   * Obtiene el timestamp del ULID como Date
   * @returns Date correspondiente al timestamp del ULID
   */
  public getTimestamp(): Date {
    const timestampPart = this.value.substring(0, 10);
    let timestamp = 0;

    // Convertimos de base32 a decimal
    for (let i = 0; i < 10; i++) {
      const char = timestampPart.charAt(i);
      const value = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.indexOf(char);
      timestamp = timestamp * 32 + value;
    }

    return new Date(timestamp);
  }

  /**
   * Compara este ULID con otro
   * @param other - Otro ULID para comparar
   * @returns -1 si este ULID es menor, 0 si son iguales, 1 si este ULID es mayor
   */
  public compare(other: ULID): number {
    if (this.value < other.value) return -1;
    if (this.value > other.value) return 1;
    return 0;
  }

  /**
   * Verifica si este ULID es igual a otro
   * @param other - Otro ULID para comparar
   * @returns true si son iguales, false en caso contrario
   */
  public equals(other: ULID | string): boolean {
    if (other instanceof ULID) {
      return this.value === other.value;
    }
    return this.value === other;
  }

  /**
   * Convierte el ULID a string
   * @returns La representación en string del ULID
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Obtiene el valor del ULID
   * @returns El valor del ULID como string
   */
  public getValue(): string {
    return this.value;
  }
}
