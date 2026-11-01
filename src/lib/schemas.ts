import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters"),
    username: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    gender: z.string().min(1, "Please select your gender"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => new Date(value) <= new Date(), {
        message: "Date of birth can't be in the future",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rePassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Current password is required"),
    next: z.string().min(6, "New password must be at least 6 characters"),
    confirm: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.next === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
