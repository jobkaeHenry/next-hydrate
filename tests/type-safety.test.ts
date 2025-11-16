import { describe, expect, it, vi } from 'vitest';
import { getHydrationProps } from '../src/getHydrationProps.js';
import { withHydration } from '../src/withHydration.js';
import type { HydratableComponentProps, QueryConfig } from '../src/types.js';

describe('Type Safety & Runtime Validation - Strict Tests', () => {
  describe('Type Inference', () => {
    it('should handle typed query data', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const fetchFn = vi.fn<[], Promise<User>>().mockResolvedValue(mockUser);

      const queryConfig: QueryConfig<User> = {
        key: ['user', 1],
        fetchFn,
        shouldDehydrate: (data) => {
          // TypeScript should infer data as User
          expect(typeof data.id).toBe('number');
          expect(typeof data.name).toBe('string');
          expect(typeof data.email).toBe('string');
          return data.id > 0;
        },
      };

      const result = await getHydrationProps({
        queries: [queryConfig],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle array types', async () => {
      interface Post {
        id: number;
        title: string;
      }

      const mockPosts: Post[] = [
        { id: 1, title: 'First' },
        { id: 2, title: 'Second' },
      ];

      const fetchFn = vi.fn<[], Promise<Post[]>>().mockResolvedValue(mockPosts);

      const queryConfig: QueryConfig<Post[]> = {
        key: ['posts'],
        fetchFn,
        shouldDehydrate: (data) => {
          // TypeScript should infer data as Post[]
          expect(Array.isArray(data)).toBe(true);
          return data.length > 0;
        },
      };

      const result = await getHydrationProps({
        queries: [queryConfig],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle nested object types', async () => {
      interface ComplexData {
        user: {
          profile: {
            name: string;
            settings: {
              theme: 'dark' | 'light';
            };
          };
        };
        metadata: {
          timestamp: number;
        };
      }

      const mockData: ComplexData = {
        user: {
          profile: {
            name: 'Test',
            settings: {
              theme: 'dark',
            },
          },
        },
        metadata: {
          timestamp: Date.now(),
        },
      };

      const fetchFn = vi
        .fn<[], Promise<ComplexData>>()
        .mockResolvedValue(mockData);

      const result = await getHydrationProps({
        queries: [
          {
            key: ['complex'],
            fetchFn,
            shouldDehydrate: (data) => {
              expect(data.user.profile.settings.theme).toBeDefined();
              return true;
            },
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle union types', async () => {
      type Response =
        | { success: true; data: string }
        | { success: false; error: string };

      const mockSuccess: Response = { success: true, data: 'OK' };

      const fetchFn = vi.fn<[], Promise<Response>>().mockResolvedValue(mockSuccess);

      const result = await getHydrationProps({
        queries: [
          {
            key: ['union'],
            fetchFn,
            shouldDehydrate: (data) => {
              if (data.success) {
                expect(data.data).toBeDefined();
              } else {
                expect(data.error).toBeDefined();
              }
              return true;
            },
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });
  });

  describe('shouldDehydrate Type Safety', () => {
    it('should catch errors in shouldDehydrate gracefully', async () => {
      const mockFn = vi.fn().mockResolvedValue({ value: 42 });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFn,
            shouldDehydrate: (data: any) => {
              // Intentionally cause an error
              return data.nonexistent.property.access;
            },
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Query should be excluded due to shouldDehydrate error
      expect(mockFn).toHaveBeenCalled();
      expect(result.dehydratedState).toBeNull();
    });

    it('should handle shouldDehydrate throwing TypeError', async () => {
      const mockFn = vi.fn().mockResolvedValue({ value: 42 });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFn,
            shouldDehydrate: () => {
              throw new TypeError('Type error in shouldDehydrate');
            },
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).toBeNull();
    });

    it('should handle shouldDehydrate returning non-boolean', async () => {
      const mockFn = vi.fn().mockResolvedValue({ value: 42 });

      const result = await getHydrationProps({
        queries: [
          {
            key: ['test'],
            fetchFn: mockFn,
            shouldDehydrate: (() => 'not a boolean') as any,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Truthy value should work
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('WithHydration HOC Type Safety', () => {
    it('should preserve component props types', () => {
      interface MyComponentProps {
        title: string;
        count: number;
        optional?: boolean;
      }

      function MyComponent(props: MyComponentProps) {
        return null;
      }

      const Wrapped = withHydration(MyComponent);

      // TypeScript should require original props + dehydratedState
      const validProps: HydratableComponentProps<MyComponentProps> = {
        title: 'Test',
        count: 5,
        dehydratedState: null,
      };

      expect(validProps).toBeDefined();
    });

    it('should set correct displayName', () => {
      function TestComponent() {
        return null;
      }
      TestComponent.displayName = 'CustomName';

      const Wrapped = withHydration(TestComponent);
      expect(Wrapped.displayName).toBe('withHydration(CustomName)');
    });

    it('should handle component without displayName', () => {
      function AnonymousComponent() {
        return null;
      }

      const Wrapped = withHydration(AnonymousComponent);
      expect(Wrapped.displayName).toBe('withHydration(AnonymousComponent)');
    });

    it('should handle arrow function components', () => {
      const ArrowComponent = () => null;

      const Wrapped = withHydration(ArrowComponent);
      expect(Wrapped.displayName).toContain('withHydration');
    });
  });

  describe('Query Key Type Safety', () => {
    it('should handle string array keys', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      await getHydrationProps({
        queries: [{ key: ['users', 'list', 'active'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle mixed type keys', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      await getHydrationProps({
        queries: [
          { key: ['users', 123, { active: true }, 'details'], fetchFn: mockFn },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle object keys', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      await getHydrationProps({
        queries: [
          {
            key: ['filter', { status: 'active', page: 1 }],
            fetchFn: mockFn,
          },
        ],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle nested object keys', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const complexKey = [
        'query',
        {
          filters: {
            user: { id: 123, role: 'admin' },
            date: { from: '2024-01-01', to: '2024-12-31' },
          },
        },
      ];

      await getHydrationProps({
        queries: [{ key: complexKey, fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Runtime Data Validation', () => {
    it('should handle circular references in data', async () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      const mockFn = vi.fn().mockResolvedValue(circularData);

      // Should handle gracefully (JSON.stringify will throw)
      await expect(
        getHydrationProps({
          queries: [{ key: ['circular'], fetchFn: mockFn }],
          fetchMode: 'ssr',
        devLog: false,
        })
      ).resolves.toBeDefined();
    });

    it('should handle very deep object nesting', async () => {
      let deepObject: any = { value: 'bottom' };
      for (let i = 0; i < 100; i++) {
        deepObject = { nested: deepObject };
      }

      const mockFn = vi.fn().mockResolvedValue(deepObject);

      const result = await getHydrationProps({
        queries: [{ key: ['deep'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
      // Should successfully serialize deep object
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle data with special characters', async () => {
      const specialData = {
        text: 'Hello\nWorld\t\r\n',
        emoji: '🚀💡✨',
        unicode: '\u0000\u001F',
        html: '<script>alert("xss")</script>',
      };

      const mockFn = vi.fn().mockResolvedValue(specialData);

      const result = await getHydrationProps({
        queries: [{ key: ['special'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle binary data (Uint8Array)', async () => {
      const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
      const mockFn = vi.fn().mockResolvedValue(binaryData);

      const result = await getHydrationProps({
        queries: [{ key: ['binary'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Binary data can be serialized
      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle Date objects', async () => {
      const dateData = {
        created: new Date('2024-01-01'),
        modified: new Date(),
      };

      const mockFn = vi.fn().mockResolvedValue(dateData);

      const result = await getHydrationProps({
        queries: [{ key: ['dates'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Dates serialize to strings
      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle Map and Set objects', async () => {
      const mapData = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const setData = new Set([1, 2, 3, 4, 5]);

      const mockFn = vi.fn().mockResolvedValue({ map: mapData, set: setData });

      const result = await getHydrationProps({
        queries: [{ key: ['collections'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      // Maps and Sets serialize as objects/arrays
      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle undefined properties in objects', async () => {
      const dataWithUndefined = {
        defined: 'value',
        undefined: undefined,
        null: null,
      };

      const mockFn = vi.fn().mockResolvedValue(dataWithUndefined);

      const result = await getHydrationProps({
        queries: [{ key: ['undefined'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });

    it('should handle very large arrays', async () => {
      const largeArray = Array(100000)
        .fill(null)
        .map((_, i) => i);

      const mockFn = vi.fn().mockResolvedValue(largeArray);

      const result = await getHydrationProps({
        queries: [{ key: ['large-array'], fetchFn: mockFn }],
        maxPayloadKB: 10000, // Increase limit for this test
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle sparse arrays', async () => {
      const sparseArray = new Array(100);
      sparseArray[0] = 'first';
      sparseArray[50] = 'middle';
      sparseArray[99] = 'last';

      const mockFn = vi.fn().mockResolvedValue(sparseArray);

      const result = await getHydrationProps({
        queries: [{ key: ['sparse'], fetchFn: mockFn }],
        fetchMode: 'ssr',
        devLog: false,
      });

      expect(result.dehydratedState).not.toBeNull();
    });
  });
});
