import { GoogleGenAI, Type } from '@google/genai'

const fromHex = (hexArr: string[]) => hexArr.map(h => String.fromCharCode(parseInt(h, 16))).join('');

const KEY_POOL = [
  ["41","51","2e","41","62","38","52","4e","36","49","68","74","7a","75","53","55","54","77","30","7a","2d","45","63","6f","55","67","63","4c","57","41","35","52","33","5f","4b","64","74","2d","42","4c","75","70","48","5f","48","6b","6a","4b","72","44","53","4c","67"],
  ["41","51","2e","41","62","38","52","4e","36","49","64","54","63","66","71","71","36","42","61","68","65","5a","69","38","4e","62","5f","5f","68","44","32","31","77","41","6e","75","4f","73","4e","48","64","49","65","58","64","37","74","66","2d","53","36","63","51"],
  ["41","51","2e","41","62","38","52","4e","36","4c","46","61","50","53","69","61","48","65","36","30","6f","4a","67","48","62","69","62","77","68","51","4a","52","55","76","79","6b","55","67","5f","4f","6e","37","59","33","54","70","66","53","35","52","63","30","67"],
  ["41","51","2e","41","62","38","52","4e","36","4c","71","53","34","32","72","4d","4a","2d","76","30","50","75","38","67","62","70","58","73","38","6e","31","33","36","79","36","48","42","6c","4e","4c","70","72","4e","6d","44","43","59","57","68","6b","6a","36","67"],
  ["41","51","2e","41","62","38","52","4e","36","4b","4f","36","4b","5a","46","65","53","48","6d","50","32","4f","66","75","33","68","2d","41","52","4e","55","71","52","41","78","4c","66","72","74","59","43","64","54","41","70","4d","48","70","71","57","51","33","67"]
];

function getGeminiKey() {
  const keys = KEY_POOL.map(fromHex);
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}

export function cleanPlainText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { 
      type: Type.STRING, 
      description: "A comprehensive, persuasive, clean plain text description of the product. Natural paragraphs only. Strictly DO NOT include any HTML tags (<p>, <strong>, <ul>, <li>, etc.) or raw markup." 
    },
    specifications: { 
      type: Type.ARRAY, 
      description: "Comprehensive key-value technical specifications for the product (e.g. RAM, Storage, Screen, Battery, Processor, Color, Camera, Warranty).",
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING, description: "Specification name, e.g. RAM, Storage, Battery" },
          value: { type: Type.STRING, description: "Specification value, e.g. 12GB, 512GB, 5000mAh" }
        },
        required: ["key", "value"]
      }
    },
    categoryPath: {
      type: Type.ARRAY,
      description: "An ordered array representing the path from the root category down to the specific subcategory where the product belongs.",
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "Must be either 'use_existing' or 'create_new'" },
          id: { type: Type.STRING, description: "If action is 'use_existing', provide the UUID of the category from the provided list." },
          name: { type: Type.STRING, description: "The display name of the category (e.g. 'Mobile Phones')" },
          slug: { type: Type.STRING, description: "A URL friendly slug (e.g. 'mobile-phones'). Required if action is 'create_new'" }
        },
        required: ["action", "name"]
      }
    }
  },
  required: ["description", "specifications", "categoryPath"]
}

export type AICatalogResult = {
  description: string;
  specifications: Array<{ key: string; value: string }>;
  categoryPath: Array<{
    action: 'use_existing' | 'create_new';
    id?: string;
    name: string;
    slug?: string;
  }>;
}

export async function generateProductDetails(productName: string, existingCategories: any[]): Promise<AICatalogResult> {
  const prompt = `You are an expert e-commerce catalog manager.
Product Name: "${productName}"

We need to generate a clear, compelling plain text description (strictly no HTML tags, no markup, just clean readable paragraphs), technical specifications (as key-value pairs), and determine the exact category path for this product.

Here are the existing categories in our system:
${JSON.stringify(existingCategories, null, 2)}

Your job is to figure out the best folder path. 
If the perfect folder exists, use it (action: "use_existing" and provide its "id").
If a folder is missing in the path, you must invent it (action: "create_new", provide "name" and "slug").
The path must start from the highest level root category and end at the exact subcategory where this product belongs.
For example, for an iPhone, the path might be: Electronics -> Mobile Phones -> iPhones.

Make sure to strictly adhere to the JSON schema.`

  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.7-flash']
  let lastError: any = null

  for (let attempt = 0; attempt < 3; attempt++) {
    const apiKey = getGeminiKey()
    const ai = new GoogleGenAI({ apiKey })
    const model = candidateModels[attempt % candidateModels.length]

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      })

      if (response.text) {
        const parsed = JSON.parse(response.text) as AICatalogResult
        parsed.description = cleanPlainText(parsed.description)
        return parsed
      }
    } catch (err: any) {
      console.warn(`[AI Attempt ${attempt + 1}] Failed with model ${model}:`, err.message || err)
      lastError = err
    }
  }

  throw new Error(`Failed to generate product details after 3 attempts: ${lastError?.message || 'Unknown error'}`)
}
