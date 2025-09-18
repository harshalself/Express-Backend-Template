/**
 * UUID Helper for Tests - Pure TypeScript implementation
 * Provides deterministic yet realistic UUID generation without ES module dependencies
 */
export class UuidTestHelper {
  private static counter = 1;

  /**
   * Generate a realistic UUID v4 for testing
   * This is a simplified but valid UUID v4 generator that avoids ES module issues
   */
  static generateRealId(): string {
    const timestamp = Date.now();
    const random1 = Math.floor(Math.random() * 0xffffffff);
    const random2 = Math.floor(Math.random() * 0xffffffff);

    const hex = (timestamp.toString(16) + random1.toString(16) + random2.toString(16))
      .padStart(32, '0')
      .substr(0, 32);

    // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return [
      hex.substr(0, 8),
      hex.substr(8, 4),
      '4' + hex.substr(13, 3), // Version 4
      ((parseInt(hex.substr(16, 1), 16) & 0x3) | 0x8).toString(16) + hex.substr(17, 3), // Variant
      hex.substr(20, 12),
    ].join('-');
  }

  /**
   * Generate a test UUID that's unique but predictable within a test session
   * Format: 00000000-0000-4000-8000-000000000XXX (where XXX is incrementing)
   */
  static generateTestId(): string {
    const paddedCounter = this.counter.toString().padStart(3, '0');
    const testUuid = `00000000-0000-4000-8000-000000000${paddedCounter}`;
    this.counter++;
    return testUuid;
  }

  /**
   * Reset counter for test isolation
   */
  static reset(): void {
    this.counter = 1;
  }

  /**
   * Validate UUID format
   */
  static isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Create a mock request ID for testing middleware
   */
  static createMockRequestId(): string {
    return `req-${this.generateTestId()}`;
  }

  /**
   * Generate multiple unique UUIDs
   */
  static generateMultiple(count: number, useReal: boolean = false): string[] {
    return Array.from({ length: count }, () =>
      useReal ? this.generateRealId() : this.generateTestId()
    );
  }
}
