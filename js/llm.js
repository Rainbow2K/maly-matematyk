// Ładowanie małych modeli przez transformers.js (ONNX Runtime Web).
// Wszystko liczy się lokalnie w przeglądarce: WebGPU, a jeśli go nie ma, WASM na CPU.

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;

export const MODELS = [
  { id: 'HuggingFaceTB/SmolLM2-135M-Instruct', label: 'SmolLM2 135M', params: 135e6 },
  { id: 'HuggingFaceTB/SmolLM2-360M-Instruct', label: 'SmolLM2 360M', params: 362e6 },
  { id: 'onnx-community/Qwen2.5-0.5B-Instruct', label: 'Qwen2.5 0.5B', params: 494e6 },
  { id: 'onnx-community/Qwen2.5-1.5B-Instruct', label: 'Qwen2.5 1.5B', params: 1544e6 },
];

export async function detectDevice() {
  try {
    if (navigator.gpu && (await navigator.gpu.requestAdapter())) return 'webgpu';
  } catch (_) { /* brak WebGPU */ }
  return 'wasm';
}

export async function loadLLM(modelId, { device, onProgress } = {}) {
  device = device || (await detectDevice());
  const dtype = device === 'webgpu' ? 'q4f16' : 'q4';
  const gen = await pipeline('text-generation', modelId, {
    device,
    dtype,
    progress_callback: onProgress,
  });
  const llm = {
    modelId, device, dtype, lastTokens: 0,
    async chat(messages, opts = {}) {
      const out = await gen(messages, {
        max_new_tokens: 64,
        do_sample: false,
        return_full_text: false,
        ...opts,
      });
      const g = out[0].generated_text;
      const text = Array.isArray(g) ? g[g.length - 1].content : String(g);
      try { llm.lastTokens = gen.tokenizer.encode(text).length; } catch (_) { llm.lastTokens = 0; }
      return text;
    },
    async dispose() { try { await gen.dispose(); } catch (_) {} },
  };
  return llm;
}
