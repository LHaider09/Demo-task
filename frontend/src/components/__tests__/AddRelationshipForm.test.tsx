import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { AddRelationshipForm } from "../AddRelationshipForm";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Person } from "../../api/type";
import { createRelationship } from "../../api/api";

const mockPeople: Person[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Grandpa",
    dateOfBirth: "1950-01-01",
    placeOfBirth: "Helsinki",
    createdAt: "2023-01-01",
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    name: "Dad",
    dateOfBirth: "1980-01-01",
    placeOfBirth: "Stockholm",
    createdAt: "2023-01-02",
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174003",
    name: "Son",
    dateOfBirth: "2010-01-01",
    placeOfBirth: "Copenhagen",
    createdAt: "2023-01-03",
  },
];

vi.mock("../../api/api", () => ({
  createRelationship: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddRelationshipForm", () => {
  it("filters out the selected child from the parent options (UX requirement)", async () => {
    render(
      <AddRelationshipForm people={mockPeople} onAdded={vi.fn()} setError={vi.fn()} />
    );

    const childSelect = screen.getByLabelText(/Child/i);
    fireEvent.change(childSelect, { target: { value: mockPeople[1].id } }); // Dad selected as child

    const parentSelect = screen.getByLabelText(/Parent/i);

    const dadOption = within(parentSelect).queryByRole("option", { name: /Dad/i });
    expect(dadOption).not.toBeInTheDocument();

    const grandpaOption = within(parentSelect).getByRole("option", { name: /Grandpa/i });
    expect(grandpaOption).toBeInTheDocument();
  });

  it("submits the form with correct IDs when valid", async () => {
    const mockOnAdded = vi.fn();

    render(
      <AddRelationshipForm people={mockPeople} onAdded={mockOnAdded} setError={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/Child/i), { target: { value: mockPeople[2].id } }); // Son
    fireEvent.change(screen.getByLabelText(/Parent/i), { target: { value: mockPeople[1].id } }); // Dad

    fireEvent.click(screen.getByRole("button", { name: /Add Parent/i }));

    await waitFor(() => {
      expect(createRelationship).toHaveBeenCalledWith({
        childId: mockPeople[2].id,
        parentId: mockPeople[1].id,
      });
    });

    await waitFor(() => {
      expect(mockOnAdded).toHaveBeenCalled();
    });
  });

  it("shows validation error if fields are empty", async () => {
    render(
      <AddRelationshipForm people={mockPeople} onAdded={vi.fn()} setError={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Parent/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a child/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a parent/i)).toBeInTheDocument();
    });
  });
});
