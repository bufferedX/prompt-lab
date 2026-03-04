export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme, vibe, productType } = req.body;

  if (!theme || !vibe || !productType) {
    return res.status(400).json({ error: "Missing required fields: theme, vibe, productType" });
  }

  const THEME_LABELS = {
    botanical: "botanical — flowers, plants, herbs, mushrooms",
    landscape: "landscape — forests, mountains, oceans, meadows",
    fantasy: "fantasy — mythical creatures, enchanted scenes, fairy tales",
    architecture: "architecture — castles, cathedrals, ruins, cottages",
    celestial: "celestial — galaxies, moons, stars, cosmic scenes",
    animals: "animals — wildlife, pets, mystical creatures",
  };

  const VIBE_LABELS = {
    "dark-academia": "dark academia — moody, vintage, literary, scholarly",
    cottagecore: "cottagecore — soft, romantic, pastoral, whimsical",
    "gothic-romantic": "gothic romantic — dark, ornate, dramatic, mysterious",
    ethereal: "ethereal — dreamy, luminous, otherworldly, delicate",
    noir: "noir — high-contrast, shadows, cinematic, urban",
    "vintage-botanical": "vintage botanical — antique illustration, muted tones, scientific",
  };

  const PRODUCT_CONFIGS = {
    "wall-art": {
      label: "Printable Wall Art",
      arMidjourney: "--ar 2:3",
      arNote: "portrait orientation (2:3) for standard print sizes (8x12, 16x24, 20x30)",
      extraMjFlags: "--style raw --stylize 750 --v 6.1",
      sizeNote: "Provide in standard print sizes: 2:3 (portrait) and 3:2 (landscape)",
    },
    "frame-tv": {
      label: "Samsung Frame TV Art",
      arMidjourney: "--ar 16:9",
      arNote: "landscape 16:9 for Samsung Frame TV (3840x2160)",
      extraMjFlags: "--style raw --stylize 750 --v 6.1",
      sizeNote: "Optimized for 3840x2160 display, landscape orientation only",
    },
    "seamless-pattern": {
      label: "Seamless Pattern / Digital Paper",
      arMidjourney: "--ar 1:1 --tile",
      arNote: "square 1:1 seamless tileable pattern",
      extraMjFlags: "--style raw --stylize 500 --v 6.1",
      sizeNote: "Square seamless tile, 3600x3600px at 300 DPI for digital paper",
    },
    clipart: {
      label: "Clipart / PNG Elements",
      arMidjourney: "--ar 1:1",
      arNote: "square 1:1, isolated subject on solid white or transparent background",
      extraMjFlags: "--style raw --stylize 400 --v 6.1",
      sizeNote: "Isolated element on plain background, PNG with transparency",
    },
  };

  const config = PRODUCT_CONFIGS[productType];
  if (!config) {
    return res.status(400).json({ error: "Invalid product type" });
  }

  const systemPrompt = `You are an expert Etsy digital download prompt engineer specializing in AI-generated art for profitable Etsy shops. You combine deep knowledge of Midjourney, DALL-E 3, and Stable Diffusion with expertise in what sells on Etsy's marketplace.

Your job is to generate 5 image prompts optimized for creating ${config.label} that will sell as digital downloads on Etsy.

PRODUCT FORMAT: ${config.label}
ASPECT RATIO: ${config.arNote}
SIZE REQUIREMENTS: ${config.sizeNote}

For each prompt you must engineer these layers:

SUBJECT — Hyper-specific subject with precise details. Never generic. Every detail must add visual value and Etsy appeal.

COMPOSITION — Exact framing optimized for ${config.label}. Consider how this will look ${productType === "frame-tv" ? "displayed on a Samsung Frame TV in a living room" : productType === "wall-art" ? "printed and framed on a wall" : productType === "seamless-pattern" ? "tiled as digital paper or fabric" : "as an isolated PNG element in a design project"}.

LIGHTING & ATMOSPHERE — Name exact light quality and color grade. This creates the mood that sells.

TECHNICAL SPEC — Camera/lens for photographic styles, or medium for illustrative styles (oil painting, watercolor, risograph, gouache, etc.).

STYLE ANCHORS — 2 specific artists or aesthetic references whose fingerprint should be felt.

${productType === "seamless-pattern" ? "PATTERN RULES — Must be seamlessly tileable. Elements should flow naturally into edges. No obvious seams or centered focal points. Describe the repeat structure (scattered, diagonal, grid, flowing).\n\n" : ""}${productType === "clipart" ? "ISOLATION RULES — Subject must be isolated on a plain white background. No background scenery. Clean edges suitable for PNG transparency extraction. Single element or small grouped set.\n\n" : ""}QUALITY BOOSTERS — End every prompt with quality markers appropriate to the style.

NEGATIVE ANCHORS — Add what to avoid: --no text, watermarks, blurry, oversaturated, generic stock aesthetic.

Critical rules:
— Every prompt must feel like a specific, sellable product — not a concept.
— Each of the 5 prompts must be completely distinct in composition, palette, and emotional register.
— Prompts must be 80-150 words each.
— Write for the image, not the reader. Every word must add visual information.
— Think about what Etsy buyers actually search for and purchase.

For each prompt return:
- A "midjourney" version: format for MJ syntax, append "${config.arMidjourney} ${config.extraMjFlags}"
- A "dalle" version: prepend "I WANT A PHOTOREALISTIC IMAGE. " (for photo styles) or describe style clearly, rephrase for DALL-E 3's natural language preference, replace --no syntax with "Do not include: [list]"
- An "etsyTitle" field: a ready-to-use Etsy listing title (max 140 chars) that includes high-traffic keywords and is compelling to buyers
- An "etsyTags" field: exactly 13 Etsy SEO tags (each max 20 chars) targeting high-traffic, relevant search terms for this product

Return ONLY valid JSON. No markdown, no code fences, no explanation.
Format: {"prompts":[{"title":"Evocative 3-5 word title","body":"Base prompt","midjourney":"MJ-optimized version","dalle":"DALL-E 3 optimized version","etsyTitle":"Etsy listing title with keywords","etsyTags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"],"mood":"2-3 word mood label","palette":"dominant color description"}]}`;

  const userMessage = `Generate 5 ${config.label} prompts for Etsy digital downloads. Subject: ${THEME_LABELS[theme]}. Aesthetic: ${VIBE_LABELS[vibe]}. Make each one a best-seller waiting to happen.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });

    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate prompts. Please try again." });
  }
}
