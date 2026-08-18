import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { z } from 'zod';

export const prerender = false;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const attempts = new Map<string, number[]>();

const clean = (value: unknown) =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim()
    : value;

const singleLine = (value: unknown) =>
  typeof clean(value) === 'string' ? (clean(value) as string).replace(/\s+/g, ' ') : clean(value);

const currentYear = new Date().getFullYear();
const contactSchema = z.object({
  name: z.preprocess(singleLine, z.string().min(2, 'Please enter your name.').max(80)),
  phone: z.preprocess(
    singleLine,
    z
      .string()
      .min(7, 'Please enter a valid phone number.')
      .max(30)
      .refine((value) => value.replace(/\D/g, '').length >= 10, 'Please include a 10-digit phone number.'),
  ),
  email: z.preprocess(
    (value) => {
      const sanitized = singleLine(value);
      return sanitized === '' ? undefined : sanitized;
    },
    z.string().email('Please enter a valid email address.').max(120).optional(),
  ),
  vehicleYear: z.preprocess(
    singleLine,
    z
      .string()
      .regex(/^\d{4}$/, 'Enter a four-digit vehicle year.')
      .refine((value) => Number(value) >= 1900 && Number(value) <= currentYear + 1, 'Enter a valid vehicle year.'),
  ),
  vehicleMakeModel: z.preprocess(singleLine, z.string().min(2, 'Please enter the make and model.').max(100)),
  issue: z.preprocess(clean, z.string().min(10, 'Please add a little more detail about the issue.').max(2000)),
  website: z.preprocess(singleLine, z.string().max(0).optional().default('')),
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return true;
  recent.push(now);
  attempts.set(ip, recent);
  return false;
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const contentType = request.headers.get('content-type') ?? '';
  let rawData: Record<string, unknown>;

  try {
    if (contentType.includes('application/json')) {
      rawData = await request.json();
    } else if (contentType.includes('form')) {
      rawData = Object.fromEntries((await request.formData()).entries());
    } else {
      return json({ message: 'Unsupported request format.' }, 415);
    }
  } catch {
    return json({ message: 'We could not read that request. Please try again.' }, 400);
  }

  // Honeypot submissions receive a generic success response so bots get no signal.
  if (typeof rawData.website === 'string' && rawData.website.trim() !== '') {
    return json({ message: 'Thanks. Your message has been received.' });
  }

  const parsed = contactSchema.safeParse(rawData);
  if (!parsed.success) {
    return json(
      {
        message: parsed.error.issues[0]?.message ?? 'Please check the form and try again.',
        fields: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || clientAddress || 'unknown';
  if (isRateLimited(ip)) {
    return json({ message: 'Too many messages were sent from this connection. Please call the shop at (507) 828-7206.' }, 429);
  }

  const apiKey = process.env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? import.meta.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL ?? import.meta.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error('Contact form is missing one or more required Resend environment variables.');
    return json({ message: 'Online messages are not configured yet. Please call the shop at (507) 828-7206.' }, 503);
  }

  const { name, phone, email, vehicleYear, vehicleMakeModel, issue } = parsed.data;
  const resend = new Resend(apiKey);
  const body = [
    'New website inquiry for Rural Route 3 Auto',
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email ?? 'Not provided'}`,
    `Vehicle: ${vehicleYear} ${vehicleMakeModel}`,
    '',
    'What is going on:',
    issue,
  ].join('\n');

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Website inquiry: ${vehicleYear} ${vehicleMakeModel} — ${name}`,
      text: body,
    });

    if (result.error) {
      console.error('Resend rejected the contact message:', result.error);
      return json({ message: 'We could not send your message right now. Please call the shop at (507) 828-7206.' }, 502);
    }

    return json({ message: 'Message sent. The shop will follow up during business hours.' });
  } catch (error) {
    console.error('Contact form delivery failed:', error);
    return json({ message: 'We could not send your message right now. Please call the shop at (507) 828-7206.' }, 502);
  }
};

export const ALL: APIRoute = () => json({ message: 'Method not allowed.' }, 405);
