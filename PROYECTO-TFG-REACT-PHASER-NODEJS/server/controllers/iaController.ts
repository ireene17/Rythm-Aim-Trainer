import express, { Request, Response } from 'express';
import { MapModel } from '../models/Map';

const router = express.Router();

const keywordRules: Record<string, string[]> = {
  puntería: ['TrackerMode', 'FlicksMode'],
  precisión: ['TrackerMode'],
  reflejos: ['ReflexedMode'],
  velocidad: ['ReflexedMode'],
  salto: ['FlicksMode'],
  cámara: ['FlicksMode'],
  flicks: ['FlicksMode'],
  seguimiento: ['TrackerMode'],
  mezcla: ['MixedMode'],
  todo: ['MixedMode'],
};

function getSuggestedCategories(prompt: string): string[] {
  const foundCategories = new Set<string>();
  const lowerPrompt = prompt.toLowerCase();

  for (const [keyword, categories] of Object.entries(keywordRules)) {
    if (lowerPrompt.includes(keyword)) {
      categories.forEach(cat => foundCategories.add(cat));
    }
  }

  return foundCategories.size > 0 ? Array.from(foundCategories) : ['MixedMode'];
}

router.post('/recomendar-mapas', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Falta el prompt del usuario' });
    return;
  }

  try {
    const sugeridas = getSuggestedCategories(prompt);
    const mapas = await MapModel.find({ categoria: { $in: sugeridas } }).limit(3);
    res.json({ resultados: mapas });
  } catch (err) {
    console.error('Error al recomendar mapas:', err);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});

export default router;
