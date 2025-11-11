import { NextRequest, NextResponse } from "next/server";

import {
  GenerateIdeaOptions,
  Idea,
  PromptPack,
  PromptTaxonomy,
  generateIdea,
  getPromptPacks,
  getPromptTaxonomy,
} from "@idea-randomizer/core";

type GenerateRequestBody = Partial<GenerateIdeaOptions> & {
  count?: number;
};

type ErrorResponse = {
  error: string;
  details?: Record<string, unknown>;
};

type SuccessResponse = {
  ideas: Idea[];
  taxonomy?: PromptTaxonomy;
  packs?: PromptPack[];
  meta: {
    generatedAt: string;
    count: number;
    filtersApplied: Partial<GenerateIdeaOptions>;
    seeds: string[];
  };
};

const MAX_IDEAS_PER_REQUEST = 5;

const respondWithError = (
  message: string,
  status: number,
  details?: Record<string, unknown>,
) =>
  NextResponse.json<ErrorResponse>(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  );

const ensureValidIds = (options: GenerateIdeaOptions): ErrorResponse | null => {
  const taxonomy = getPromptTaxonomy();
  const packs = getPromptPacks();

  const invalidEntries: Record<string, string> = {};

  if (options.packId) {
    const packExists = packs.some((pack) => pack.id === options.packId);
    if (!packExists) {
      invalidEntries.packId = options.packId;
    }
  }

  if (options.themeId) {
    const exists = taxonomy.themes.some((item) => item.id === options.themeId);
    if (!exists) {
      invalidEntries.themeId = options.themeId;
    }
  }

  if (options.audienceId) {
    const exists = taxonomy.audiences.some(
      (item) => item.id === options.audienceId,
    );
    if (!exists) {
      invalidEntries.audienceId = options.audienceId;
    }
  }

  if (options.problemId) {
    const exists = taxonomy.problems.some(
      (item) => item.id === options.problemId,
    );
    if (!exists) {
      invalidEntries.problemId = options.problemId;
    }
  }

  if (options.twistId) {
    const exists = taxonomy.twists.some((item) => item.id === options.twistId);
    if (!exists) {
      invalidEntries.twistId = options.twistId;
    }
  }

  return Object.keys(invalidEntries).length
    ? {
        error: "One or more prompt identifiers are invalid.",
        details: invalidEntries,
      }
    : null;
};

const parseStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error("Expected an array of strings.");
  }

  const normalized = value.map((item) => {
    if (typeof item !== "string") {
      throw new Error("Expected an array of strings.");
    }
    return item.trim().toLowerCase();
  });

  return normalized.filter(Boolean);
};

const parseGenerateRequest = async (
  req: NextRequest,
): Promise<GenerateRequestBody> => {
  if (req.method !== "POST") {
    return {};
  }

  if (req.headers.get("content-length") === "0") {
    return {};
  }

  const body = await req.json();

  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be a JSON object.");
  }

  const {
    count,
    themeId,
    audienceId,
    problemId,
    twistId,
    packId,
    seed,
    includeTags,
    avoidTags,
  } = body as Record<string, unknown>;

  let parsedCount = 1;
  if (count !== undefined) {
    if (typeof count !== "number" || Number.isNaN(count)) {
      throw new Error("`count` must be a number.");
    }
    parsedCount = Math.min(
      Math.max(Math.floor(count), 1),
      MAX_IDEAS_PER_REQUEST,
    );
  }

  const options: GenerateIdeaOptions = {
    themeId: typeof themeId === "string" ? themeId : undefined,
    audienceId: typeof audienceId === "string" ? audienceId : undefined,
    problemId: typeof problemId === "string" ? problemId : undefined,
    twistId: typeof twistId === "string" ? twistId : undefined,
    packId: typeof packId === "string" ? packId : undefined,
    seed: typeof seed === "string" ? seed : undefined,
    includeTags: parseStringArray(includeTags),
    avoidTags: parseStringArray(avoidTags),
  };

  const validationError = ensureValidIds(options);
  if (validationError) {
    throw validationError;
  }

  return {
    ...options,
    count: parsedCount,
  };
};

export function GET() {
  const taxonomy = getPromptTaxonomy();
  const packs = getPromptPacks();
  const idea = generateIdea();

  return NextResponse.json<SuccessResponse>({
    ideas: [idea],
    taxonomy,
    packs,
    meta: {
      generatedAt: new Date().toISOString(),
      count: 1,
      filtersApplied: {},
      seeds: [idea.seed],
    },
  });
}

export async function POST(req: NextRequest) {
  let parsedBody: GenerateRequestBody = {};

  try {
    parsedBody = await parseGenerateRequest(req);
  } catch (error) {
    if (error && typeof error === "object" && "error" in error) {
      const typedError = error as ErrorResponse;
      return respondWithError(
        typedError.error,
        400,
        typedError.details as Record<string, unknown>,
      );
    }

    return respondWithError(
      error instanceof Error ? error.message : "Invalid request payload.",
      400,
    );
  }

  const { count = 1, ...filters } = parsedBody;
  const ideas = Array.from({ length: count }, () => generateIdea(filters));

  return NextResponse.json<SuccessResponse>({
    ideas,
    meta: {
      generatedAt: new Date().toISOString(),
      count,
      filtersApplied: filters,
      seeds: ideas.map((idea) => idea.seed),
    },
  });
}

