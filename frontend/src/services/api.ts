import { z } from "zod";

const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().nullable().optional(),
    request_id: z.string().nullable().optional(),
  });

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function getApiData<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
): Promise<z.infer<T>> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const payload = apiResponseSchema(schema).parse(await response.json());
  return payload.data;
}
