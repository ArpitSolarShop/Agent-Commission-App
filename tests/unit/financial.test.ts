import { describe, it, expect } from 'vitest';

// A mock function simulating an EMI Calculator (Unit Testing)
function calculateEMI(principal: number, rate: number, tenureMonths: number) {
  if (principal === 0) return 0;
  const r = rate / 12 / 100; // Monthly interest rate
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

// A mock function simulating Commission Calculation (Unit Testing)
function calculateCommission(dealValue: number, commissionType: 'PERCENTAGE' | 'FIXED_AMOUNT', rate: number) {
  if (commissionType === 'FIXED_AMOUNT') return rate;
  return (dealValue * rate) / 100;
}

describe('Unit Testing: Financial Calculations', () => {
  it('should calculate EMI correctly for standard loan', () => {
    // 100,000 principal, 10% annual interest, 12 months
    const emi = calculateEMI(100000, 10, 12);
    expect(emi).toBe(8792);
  });

  it('should handle zero principal EMI calculation', () => {
    const emi = calculateEMI(0, 10, 12);
    expect(emi).toBe(0);
  });

  it('should calculate PERCENTAGE commission accurately', () => {
    // 50,000 deal, 5% commission
    const commission = calculateCommission(50000, 'PERCENTAGE', 5);
    expect(commission).toBe(2500);
  });

  it('should calculate FIXED_AMOUNT commission accurately', () => {
    // 50,000 deal, 5000 fixed
    const commission = calculateCommission(50000, 'FIXED_AMOUNT', 5000);
    expect(commission).toBe(5000);
  });
});
