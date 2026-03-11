const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

export async function getGuest(
  name: string
): Promise<{ name: string; photos_taken: number } | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/guests?name=ilike.${encodeURIComponent(name)}&select=name,photos_taken`,
    { headers }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

export async function createOrGetGuest(
  name: string
): Promise<{ name: string; photos_taken: number }> {
  // Try to get existing guest first
  const existing = await getGuest(name);
  if (existing) return existing;

  // Create new guest
  const res = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ name, photos_taken: 0 }),
  });

  if (res.ok) {
    const data = await res.json();
    return data[0];
  }

  // Handle 409 conflict (race condition) by re-fetching
  if (res.status === 409) {
    const refetched = await getGuest(name);
    if (refetched) return refetched;
  }

  throw new Error(`Failed to create guest: ${res.status}`);
}

export async function incrementPhotoCount(name: string): Promise<number> {
  // Fetch current count first
  const guest = await getGuest(name);
  if (!guest) throw new Error("Guest not found");

  const newCount = guest.photos_taken + 1;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/guests?name=ilike.${encodeURIComponent(name)}`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ photos_taken: newCount }),
    }
  );

  if (!res.ok) throw new Error(`Failed to increment photo count: ${res.status}`);

  const data = await res.json();
  return data[0].photos_taken;
}
