require('dotenv').config();
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// utility function: convert image Buffer or local path to base64 data URL
function imageToDataUrl(imageBufferOrPath) {
  console.log(
    'imageToDataUrl input:',
    {
      type: typeof imageBufferOrPath,
      isBuffer: Buffer.isBuffer(imageBufferOrPath),
      isUint8Array: imageBufferOrPath instanceof Uint8Array,
      preview: typeof imageBufferOrPath === 'string'
        ? imageBufferOrPath.slice(0, 100)
        : (Buffer.isBuffer(imageBufferOrPath) || imageBufferOrPath instanceof Uint8Array)
          ? imageBufferOrPath.slice(0, 16)
          : imageBufferOrPath
    }
  );
  if (typeof imageBufferOrPath === 'string' && imageBufferOrPath.startsWith('data:image')) {
    return imageBufferOrPath;
  }
  if (Buffer.isBuffer(imageBufferOrPath) || imageBufferOrPath instanceof Uint8Array) {
    // default jpeg
    const base64 = Buffer.from(imageBufferOrPath).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  }
  if (typeof imageBufferOrPath === 'string' && (imageBufferOrPath.endsWith('.jpg') || imageBufferOrPath.endsWith('.jpeg') || imageBufferOrPath.endsWith('.png') || imageBufferOrPath.endsWith('.webp') || imageBufferOrPath.endsWith('.gif'))) {
    const ext = path.extname(imageBufferOrPath).slice(1) || 'jpeg';
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    const data = fs.readFileSync(imageBufferOrPath, { encoding: 'base64' });
    return `data:image/${mime};base64,${data}`;
  }
  throw new Error('Unsupported image input: not a Buffer, not a valid file path, not a data URL');
}



class AIService {
    constructor() {
      this.apiKey = process.env.AI_API_KEY;
      this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      this.model = 'gpt-4o';  // use GPT-4 0125 Preview model
  }

  generatePrompt(submission) {
    const { fromWork, toWork, type, userComment } = submission;
    
    // fromWork is always the source of inspiration, toWork is always the affected work
    const prompt = `User believes that "${fromWork.title}" (${fromWork.type}, ${fromWork.year}) inspired "${toWork.title}" (${toWork.type}, ${toWork.year}) through "${type}" connection. 
Connection Types:
- Visual Homage: Direct visual references or similar scenes
- Quote Borrowing: Direct or adapted dialogue/text quotes
- Thematic Echo: Similar themes, messages, or story elements
- Character Inspiration: Similar character traits or arcs
- Other: Other types of connections

Image 1 is a scene from "${fromWork.title}" and Image 2 is a scene from "${toWork.title}". 
User's explanation: "${userComment}".

RESPONSE FORMAT:
VALIDITY: [Must be exactly "Likely Valid" or "Likely Invalid"]
EXPLANATION: [Brief explanation within 100 words]

RULES:
1. If the images do not match the described works, mark as "Likely Invalid"
2. The validity must be the first word of your response
3. If the connection type does not match the evidence (images/explanation), mark as "Likely Invalid"
4. Keep the explanation concise and focused on the connection between the works`;
    console.log('DEBUG AI PROMPT:\n', prompt);
    return prompt;
  }

  async processImagesForAI(images) {
    try {
      const processedImages = await Promise.all(
        images.map(async (imageBuffer) => {
          // if already in base64 format, use it directly
          if (typeof imageBuffer === 'string' && imageBuffer.startsWith('data:image')) {
            return imageBuffer;
          }

          const jpegBuffer = await sharp(imageBuffer)
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();

          const base64Image = jpegBuffer.toString('base64');
          return `data:image/jpeg;base64,${base64Image}`;
        })
      );
      return processedImages;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process images for AI');
    }
  }

  async getAIJudgment(submission) {
    try {
      // convert to base64 data URL
      const fromImageDataUrl = imageToDataUrl(submission.fromWork.image);
      const toImageDataUrl = imageToDataUrl(submission.toWork.image);
      const prompt = this.generatePrompt(submission);
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: fromImageDataUrl
              }
            },
            {
              type: "image_url",
              image_url: {
                url: toImageDataUrl
              }
            }
          ]
        }
      ];

      const response = await axios.post(
        this.apiEndpoint,
        {
          model: this.model,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('AI judgment error: Request timed out');
        throw new Error('AI judgment request timed out. Please try again later.');
      } else if (error.response) {
        console.error('AI judgment error:', error.response.data);
        throw new Error('Failed to get AI judgment from OpenAI: ' + (error.response.data?.error?.message || 'Unknown error'));
      } else {
        console.error('AI judgment error:', error.message || error);
        throw new Error('Failed to get AI judgment from OpenAI: ' + (error.message || 'Unknown error'));
      }
    }
  }
}

module.exports = new AIService();