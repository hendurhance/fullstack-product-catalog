import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const MAX_TAGS = 50;

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("x-revalidation-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing X-Revalidation-Signature header" },
      { status: 401 },
    );
  }

  const raw = await request.text();
  let tags: string[];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        { error: "Payload must be a non-empty array of tag strings" },
        { status: 400 },
      );
    }
    if (parsed.length > MAX_TAGS) {
      return NextResponse.json(
        { error: `Too many tags (max ${MAX_TAGS})` },
        { status: 400 },
      );
    }
    if (!parsed.every((t: unknown): t is string => typeof t === "string")) {
      return NextResponse.json(
        { error: "Every tag must be a string" },
        { status: 400 },
      );
    }
    tags = parsed;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    )
  ) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 403 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    now: Date.now(),
  });
}
