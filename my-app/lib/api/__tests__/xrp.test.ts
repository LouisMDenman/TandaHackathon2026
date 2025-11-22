/**
 * Tests for XRP API client
 */

import { fetchXrpBalance, fetchMultipleXrpBalances } from '../xrp';

// Mock global fetch
global.fetch = jest.fn();

describe('XRP API', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    // Suppress console.warn during tests to keep output clean
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore console.warn after each test
    consoleWarnSpy.mockRestore();
  });

  describe('fetchXrpBalance', () => {
    it('should fetch balance successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '100000000',
              OwnerCount: 0,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 1,
            },
            ledger_current_index: 123456,
            validated: true,
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(100);
      expect(result.balance).toBe(100000000);
      expect(result.accountExists).toBe(true);
      expect(result.ownerCount).toBe(0);
    });

    it('should handle account not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          error: {
            error: 'actNotFound',
            error_code: 19,
            error_message: 'Account not found.',
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.accountExists).toBe(false);
      expect(result.balanceInXrp).toBe(0);
      expect(result.error).toContain('not found');
    });

    it('should handle balance with owner count', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '50000000',
              OwnerCount: 5,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 10,
            },
            ledger_current_index: 123456,
            validated: true,
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(50);
      expect(result.ownerCount).toBe(5);
    });

    it('should retry on failure with fallback endpoints', async () => {
      // First endpoint fails
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        // Second endpoint succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              account_data: {
                Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
                Balance: '50000000',
                OwnerCount: 0,
                Flags: 0,
                LedgerEntryType: 'AccountRoot',
                Sequence: 1,
              },
              ledger_current_index: 123456,
              validated: true,
            },
          }),
        });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(50);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });

    it('should handle RPC errors', async () => {
      // Mock all endpoints to fail with the same error
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: {
              error: 'unknown_error',
              error_code: 999,
              error_message: 'Some unknown error occurred',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: {
              error: 'unknown_error',
              error_code: 999,
              error_message: 'Some unknown error occurred',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: {
              error: 'unknown_error',
              error_code: 999,
              error_message: 'Some unknown error occurred',
            },
          }),
        });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });

    it('should handle timeout', async () => {
      // Mock fetch to simulate timeout by all endpoints failing
      for (let i = 0; i < 3; i++) {
        (global.fetch as jest.Mock).mockImplementationOnce(() => {
          return new Promise((_, reject) => {
            const error: any = new Error('Request timeout');
            error.name = 'AbortError';
            reject(error);
          });
        });
      }

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    }, 10000);

    it('should handle zero balance', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '0',
              OwnerCount: 0,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 1,
            },
            ledger_current_index: 123456,
            validated: true,
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(0);
      expect(result.accountExists).toBe(true);
    });

    it('should handle large balances', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '1000000000000', // 1 million XRP
              OwnerCount: 0,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 1,
            },
            ledger_current_index: 123456,
            validated: true,
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(1000000);
    });

    it('should handle small balances', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '1', // 0.000001 XRP (1 drop)
              OwnerCount: 0,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 1,
            },
            ledger_current_index: 123456,
            validated: true,
          },
        }),
      });

      const result = await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      expect(result.status).toBe('success');
      expect(result.balanceInXrp).toBe(0.000001);
    });
  });

  describe('fetchMultipleXrpBalances', () => {
    it('should fetch multiple balances successfully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              account_data: {
                Account: 'rAddress1',
                Balance: '100000000',
                OwnerCount: 0,
                Flags: 0,
                LedgerEntryType: 'AccountRoot',
                Sequence: 1,
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              account_data: {
                Account: 'rAddress2',
                Balance: '200000000',
                OwnerCount: 0,
                Flags: 0,
                LedgerEntryType: 'AccountRoot',
                Sequence: 1,
              },
            },
          }),
        });

      const results = await fetchMultipleXrpBalances(['rAddress1', 'rAddress2']);

      expect(results).toHaveLength(2);
      expect(results[0].balanceInXrp).toBe(100);
      expect(results[1].balanceInXrp).toBe(200);
    });

    it('should handle mixed success and failure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: {
              account_data: {
                Account: 'rAddress1',
                Balance: '100000000',
                OwnerCount: 0,
                Flags: 0,
                LedgerEntryType: 'AccountRoot',
                Sequence: 1,
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: {
              error: 'actNotFound',
              error_code: 19,
              error_message: 'Account not found.',
            },
          }),
        });

      const results = await fetchMultipleXrpBalances(['rAddress1', 'rAddress2']);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[1].accountExists).toBe(false);
    });

    it('should handle empty array', async () => {
      const results = await fetchMultipleXrpBalances([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('Request Format', () => {
    it('should send correct JSON-RPC request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            account_data: {
              Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
              Balance: '100000000',
              OwnerCount: 0,
              Flags: 0,
              LedgerEntryType: 'AccountRoot',
              Sequence: 1,
            },
          },
        }),
      });

      await fetchXrpBalance('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.method).toBe('account_info');
      expect(requestBody.params[0].account).toBe('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh');
      expect(requestBody.params[0].ledger_index).toBe('validated');
      expect(requestBody.params[0].strict).toBe(true);
    });
  });
});
