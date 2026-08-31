import { GoogleGenAI, Type } from '@google/genai'

function getGeminiKey() {
  const keysStr = process.env.GEMINI_API_KEYS || ''
  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0)
  if (keys.length === 0) throw new Error("No Gemini keys found in environment variables")
  const randomIndex = Math.floor(Math.random() * keys.length)
  return keys[randomIndex]
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { 
      type: Type.STRING, 
      description: "A rich, persuasive, SEO-optimized HTML description of the product (using basic html tags like <p>, <ul>, <strong>)." 
    },
    specifications: { 
      type: Type.OBJECT, 
      description: "Technical specifications. The key should be the feature name (e.g. 'RAM'), value is detail (e.g. '8GB'). Do not nest objects." 
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
  specifications: Record<string, string>;
  categoryPath: Array<{
    action: 'use_existing' | 'create_new';
    id?: string;
    name: string;
    slug?: string;
  }>;
}

export async function generateProductDetails(productName: string, existingCategories: any[]): Promise<AICatalogResult> {
  const apiKey = getGeminiKey()
  const ai = new GoogleGenAI({ apiKey })
  
  const prompt = `You are an expert e-commerce catalog manager.
Product Name: "${productName}"

We need to generate a rich HTML description, technical specifications (as a JSON key-value map), and determine the exact category path for this product.

Here are the existing categories in our system:
${JSON.stringify(existingCategories, null, 2)}

Your job is to figure out the best folder path. 
If the perfect folder exists, use it (action: "use_existing" and provide its "id").
If a folder is missing in the path, you must invent it (action: "create_new", provide "name" and "slug").
The path must start from the highest level root category and end at the exact subcategory where this product belongs.
For example, for an iPhone, the path might be: Electronics -> Mobile Phones -> iPhones.

Make sure to strictly adhere to the JSON schema.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.2
    }
  })

  return JSON.parse(response.text || '{}') as AICatalogResult
}
