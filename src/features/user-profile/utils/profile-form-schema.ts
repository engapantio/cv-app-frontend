import { z } from "zod";

const optionalField = (label: string, maxLength: number) =>
  z.string().trim().max(maxLength, `${label} must be ${maxLength} characters or less`).optional();

export const profileSchema = z
  .object({
    first_name: optionalField("First name", 100),
    last_name: optionalField("Last name", 100),
    departmentId: optionalField("Department", 100),
    positionId: optionalField("Position", 100),
  })
  .refine(
    (values) =>
      [values.first_name, values.last_name, values.departmentId, values.positionId].some(
        (value) => value !== undefined && value.length > 0,
      ),
    {
      message: "At least one profile field must be filled",
      path: ["first_name"],
    },
  );

export type ProfileFormValues = z.infer<typeof profileSchema>;
