import { prisma } from "../prisma";
import { ApiError } from "../errors/apiError";
import type { CreatePersonInput } from "../validation/people.schema";

export async function createPerson(input: CreatePersonInput) {
  const name = input.name.trim();
  const place = input.placeOfBirth?.trim();

  const dob = new Date(input.dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new ApiError(400, "INVALID_DOB", "Date of birth is not a valid date");
  }

  const now = new Date();
  if (dob > now) {
    throw new ApiError(400, "DOB_IN_FUTURE", "Date of birth cannot be in the future");
  }

  const person = await prisma.person.create({
    data: {
      name,
      dateOfBirth: dob,
      placeOfBirth: place || null,
    },
  });

  return person;
}

export async function listPeople() {
  return prisma.person.findMany({
    orderBy: { createdAt: "asc" },
  });
}
