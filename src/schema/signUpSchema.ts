import {z} from 'zod';

export const userNameValidation = z
    .string()
    .min(2,"User name must be of at least of two characters")
    .max(20,"User name must be of at most of twenty characters")
    .regex(/^[a-zA-Z0-9_]+$/,"User name must not contain any special character");

export const signUpSchema = z.object({
    username: userNameValidation,
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(6, { message: 'Password must be of 8 characters' })
        .max(6,"Password must be of 8 characters")
});