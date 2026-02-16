import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DcrProvider } from '@/store/dcr-context'
import { DcrPane } from '@/components/editor/DcrPane'
import { SourcePane } from '@/components/source/SourcePane'
import {
  generateDcr,
  inferColumnsFromJson,
  parseJsonSafely,
  validateDcr,
} from '@/lib/dcr-utils'

/**
 * End-to-end workflow tests for DCR Builder
 */
describe('DCR Builder E2E Workflows', () => {
  describe('JSON Inference & Type Detection', () => {
    it('should infer columns from simple JSON object', () => {
      const json = {
        name: 'John',
        age: 30,
        active: true,
        balance: 100.5,
        created: '2024-01-15T10:30:00Z',
      }

      const columns = inferColumnsFromJson(json)

      expect(columns).toHaveLength(5)
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'name', type: 'string' }),
      )
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'age', type: 'int' }),
      )
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'active', type: 'boolean' }),
      )
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'balance', type: 'real' }),
      )
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'created', type: 'datetime' }),
      )
    })

    it('should sample multiple array objects for consistency', () => {
      const json = [
        { id: 1, name: 'Alice', score: 95.5 },
        { id: 2, name: 'Bob', score: 87.3 },
        { id: 3, name: 'Charlie', score: 92.1 },
      ]

      const columns = inferColumnsFromJson(json)

      // Should detect all columns despite sampling
      expect(columns.map((c) => c.name).sort()).toEqual(['id', 'name', 'score'])
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'id', type: 'int' }),
      )
    })

    it('should handle mixed types gracefully', () => {
      const json = [
        { value: 'string' },
        { value: 42 },
        { value: 3.14 },
        { value: true },
      ]

      // Should not throw
      const columns = inferColumnsFromJson(json)
      expect(columns).toHaveLength(1)
    })

    it('should detect ISO 8601 dates correctly', () => {
      const dates = [
        '2024-01-15',
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00+02:00',
        '2024-01-15T10:30:00.123Z',
      ]

      for (const date of dates) {
        const columns = inferColumnsFromJson({ timestamp: date })
        expect(columns[0].type).toBe('datetime')
      }
    })

    it('should reject non-ISO dates', () => {
      const notDates = [
        '2024/01/15',
        '01-15-2024',
        'January 15, 2024',
        '15.01.2024',
      ]

      for (const notDate of notDates) {
        const columns = inferColumnsFromJson({ value: notDate })
        expect(columns[0].type).toBe('string')
      }
    })

    it('should treat nested objects as dynamic', () => {
      const json = {
        user: { name: 'John', age: 30 },
        tags: ['a', 'b', 'c'],
      }

      const columns = inferColumnsFromJson(json)

      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'user', type: 'dynamic' }),
      )
      expect(columns).toContainEqual(
        expect.objectContaining({ name: 'tags', type: 'dynamic' }),
      )
    })
  })

  describe('JSON Validation & Safety', () => {
    it('should parse valid JSON safely', () => {
      const json = '{"name":"John","age":30}'
      const result = parseJsonSafely(json)
      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should reject invalid JSON', () => {
      const invalidJson = '{"name":"John"invalid json}'
      expect(() => parseJsonSafely(invalidJson)).toThrow('Invalid JSON')
    })

    it('should reject JSON exceeding size limit', () => {
      // Create a large JSON string (>10MB)
      const largeJson = JSON.stringify({
        data: 'x'.repeat(11 * 1024 * 1024),
      })

      expect(() => parseJsonSafely(largeJson)).toThrow('exceeds maximum size')
    })

    it('should handle empty and null inputs', () => {
      expect(inferColumnsFromJson(null)).toEqual([])
      expect(inferColumnsFromJson(undefined)).toEqual([])
      expect(inferColumnsFromJson([])).toEqual([])
      expect(inferColumnsFromJson({})).toEqual([])
    })
  })

  describe('DCR Validation', () => {
    const validFormData = {
      name: 'MyDCR',
      location: 'eastus',
      description: 'Test DCR',
      streamDeclarations: {
        'Custom-MyStream': {
          columns: [{ name: 'id', type: 'int' as const }],
        },
      },
      destinations: {
        logAnalytics: [
          {
            subscriptionId: '00000000-0000-0000-0000-000000000000',
            resourceGroupName: 'rg',
            workspaceName: 'ws',
            name: 'MyWorkspace',
          },
        ],
      },
      dataFlows: [
        {
          streams: ['Custom-MyStream'],
          destinations: ['MyWorkspace'],
          transformKql: 'source',
          outputStream: 'Custom-MyStream_CL',
        },
      ],
    }

    it('should validate complete DCR successfully', () => {
      const errors = validateDcr(validFormData)
      expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const incomplete = { ...validFormData, name: '' }
      const errors = validateDcr(incomplete)
      expect(errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          severity: 'error',
        }),
      )
    })

    it('should validate stream names', () => {
      const invalidStream = {
        ...validFormData,
        streamDeclarations: {
          InvalidStream: { columns: [{ name: 'id', type: 'int' as const }] },
        },
      }
      const errors = validateDcr(invalidStream)
      expect(errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Custom-'),
          severity: 'error',
        }),
      )
    })

    it('should validate subscription ID format', () => {
      const invalidDest = {
        ...validFormData,
        destinations: {
          logAnalytics: [
            {
              subscriptionId: 'not-a-guid',
              resourceGroupName: 'rg',
              workspaceName: 'ws',
              name: 'InvalidWorkspace',
            },
          ],
        },
      }
      const errors = validateDcr(invalidDest)
      expect(errors).toContainEqual(
        expect.objectContaining({
          severity: 'warning',
        }),
      )
    })

    it('should require KQL transformation', () => {
      const noKql = {
        ...validFormData,
        dataFlows: [
          {
            streams: ['Custom-MyStream'],
            destinations: ['MyWorkspace'],
            transformKql: '',
            outputStream: 'Custom-MyStream_CL',
          },
        ],
      }
      const errors = validateDcr(noKql)
      expect(errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('KQL'),
          severity: 'error',
        }),
      )
    })
  })

  describe('DCR Generation', () => {
    it('should generate valid DCR structure', () => {
      const formData = {
        name: 'TestDCR',
        location: 'westus',
        description: 'Test',
        streamDeclarations: {
          'Custom-TestStream': {
            columns: [
              { name: 'id', type: 'int' as const },
              { name: 'message', type: 'string' as const },
            ],
          },
        },
        destinations: {
          logAnalytics: [
            {
              subscriptionId: '00000000-0000-0000-0000-000000000000',
              resourceGroupName: 'rg',
              workspaceName: 'ws',
              name: 'TestWs',
            },
          ],
        },
        dataFlows: [
          {
            streams: ['Custom-TestStream'],
            destinations: ['TestWs'],
            transformKql: 'source',
            outputStream: 'Custom-TestStream_CL',
          },
        ],
      }

      const dcr = generateDcr(formData)

      expect(dcr).toHaveProperty('location', 'westus')
      expect(dcr).toHaveProperty('kind', 'Direct')
      expect(dcr).toHaveProperty('properties')
      expect((dcr as any).properties).toHaveProperty('streamDeclarations')
      expect((dcr as any).properties).toHaveProperty('destinations')
      expect((dcr as any).properties).toHaveProperty('dataFlows')
    })
  })

  describe('Workflow Integration', () => {
    it('should handle complete workflow: JSON input → inference → validation → generation', async () => {
      // Step 1: Input JSON
      const inputJson = JSON.stringify([
        {
          timestamp: '2024-01-15T10:30:00Z',
          severity: 'info',
          message: 'Application started',
        },
        {
          timestamp: '2024-01-15T10:31:00Z',
          severity: 'warning',
          message: 'Low memory',
        },
      ])

      // Step 2: Parse and infer
      const parsed = parseJsonSafely(inputJson)
      const columns = inferColumnsFromJson(parsed)

      expect(columns).toHaveLength(3)
      expect(columns.map((c) => c.type)).toContain('datetime')

      // Step 3: Build form data
      const formData = {
        name: 'LogIngestion',
        location: 'eastus',
        description: 'Log ingestion DCR',
        streamDeclarations: {
          'Custom-Logs': { columns },
        },
        destinations: {
          logAnalytics: [
            {
              subscriptionId: '00000000-0000-0000-0000-000000000000',
              resourceGroupName: 'rg',
              workspaceName: 'ws',
              name: 'LogsWorkspace',
            },
          ],
        },
        dataFlows: [
          {
            streams: ['Custom-Logs'],
            destinations: ['LogsWorkspace'],
            transformKql: 'source | where severity == "error"',
            outputStream: 'Custom-Logs_CL',
          },
        ],
      }

      // Step 4: Validate
      const errors = validateDcr(formData)
      expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)

      // Step 5: Generate
      const dcr = generateDcr(formData)
      expect(dcr).toHaveProperty('kind', 'Direct')
      const generatedColumns = (dcr as any).properties.streamDeclarations[
        'Custom-Logs'
      ].columns
      expect(generatedColumns).toHaveLength(columns.length)
      for (const col of columns) {
        expect(generatedColumns).toContainEqual(
          expect.objectContaining({ name: col.name, type: col.type }),
        )
      }
    })
  })
})
