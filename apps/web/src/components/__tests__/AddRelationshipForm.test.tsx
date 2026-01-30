import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AddRelationshipForm } from '../AddRelationshipForm';
import { vi, describe, it, expect } from 'vitest';
import type { Person } from '../../api/type';
import { createRelationship } from '../../api/api';

// 1. Mock Data with VALID UUIDs so Zod passes
const mockPeople: Person[] = [
  { 
    id: '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
    name: 'Grandpa', 
    dateOfBirth: '1950-01-01', 
    placeOfBirth: 'Helsinki',
    createdAt: '2023-01-01' 
  },
  { 
    id: '123e4567-e89b-12d3-a456-426614174002', // Valid UUID
    name: 'Dad', 
    dateOfBirth: '1980-01-01', 
    placeOfBirth: 'Stockholm',
    createdAt: '2023-01-02' 
  },
  { 
    id: '123e4567-e89b-12d3-a456-426614174003', // Valid UUID
    name: 'Son', 
    dateOfBirth: '2010-01-01', 
    placeOfBirth: 'Copenhagen',
    createdAt: '2023-01-03' 
  },
];

// 2. Mock the API module
vi.mock('../../api/api', () => ({
  createRelationship: vi.fn(),
}));

describe('AddRelationshipForm', () => {
  it('filters out the selected child from the parent options (UX Requirement)', async () => {
    render(
      <AddRelationshipForm 
        people={mockPeople} 
        onAdded={vi.fn()} 
        setInfo={vi.fn()} 
        setError={vi.fn()} 
      />
    );

    // Select "Dad"
    const childSelect = screen.getByLabelText(/Child/i);
    fireEvent.change(childSelect, { target: { value: mockPeople[1].id } });

    // Open Parent dropdown
    const parentSelect = screen.getByLabelText(/Parent/i);
    
    // Check "Dad" is NOT in parent options
    const dadOption = within(parentSelect).queryByRole('option', { name: /Dad/i });
    expect(dadOption).not.toBeInTheDocument();

    // Check "Grandpa" IS in parent options
    const grandpaOption = within(parentSelect).getByRole('option', { name: /Grandpa/i });
    expect(grandpaOption).toBeInTheDocument();
  });

  it('submits the form with correct IDs when valid', async () => {
    const mockOnAdded = vi.fn();
    
    render(
      <AddRelationshipForm 
        people={mockPeople} 
        onAdded={mockOnAdded} 
        setInfo={vi.fn()} 
        setError={vi.fn()} 
      />
    );

    // 1. Select Child (Son)
    fireEvent.change(screen.getByLabelText(/Child/i), { target: { value: mockPeople[2].id } }); 

    // 2. Select Parent (Dad)
    fireEvent.change(screen.getByLabelText(/Parent/i), { target: { value: mockPeople[1].id } }); 

    // 3. Submit
    const submitBtn = screen.getByRole('button', { name: /Add Parent/i });
    fireEvent.click(submitBtn);

    // 4. Verify API was called
    await waitFor(() => {
      expect(createRelationship).toHaveBeenCalledWith({
        childId: mockPeople[2].id,
        parentId: mockPeople[1].id
      });
    });

    // 5. Verify success callback
    expect(mockOnAdded).toHaveBeenCalled();
  });

  it('shows validation error if fields are empty', async () => {
    render(
      <AddRelationshipForm 
        people={mockPeople} 
        onAdded={vi.fn()} 
        setInfo={vi.fn()} 
        setError={vi.fn()} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Parent/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a child/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a parent/i)).toBeInTheDocument();
    });
  });
});