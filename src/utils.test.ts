import { describe, it, expect } from 'vitest';
import { generateBlob, randomInt, uniqueName } from './utils';

describe('utils', () => {
    describe('randomInt', () => {
        it('should return an integer between min and max', () => {
            const min = 1;
            const max = 10;
            const result = randomInt(min, max);
            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThanOrEqual(max);
            expect(Number.isInteger(result)).toBe(true);
        });
    });

    describe('uniqueName', () => {
        it('should return a string', () => {
            const result = uniqueName();
            expect(typeof result).toBe('string');
        });

        it('should contain hyphens', () => {
            const result = uniqueName();
            expect(result).toContain('-');
        });
    });

    describe('generateBlob', () => {
        it('should generate a blob with svgPath', () => {
            const result = generateBlob();
            expect(result).toHaveProperty('svgPath');
            expect(result).toHaveProperty('parameters');
            expect(typeof result.svgPath).toBe('string');
        });

        it('should respect parameters', () => {
            const result = generateBlob({ edges: 5, size: 100 });
            expect(result.parameters.edges).toBe(5);
            expect(result.parameters.size).toBe(100);
        });
    });
});
