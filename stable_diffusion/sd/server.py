from flask import Flask, request, jsonify
from PIL import Image
import io, base64
import torch, gc

import model_loader
import pipeline
from transformers import CLIPTokenizer

# -------------------------------
# 1. Load Models ONCE Globally
# -------------------------------

gc.collect()
if torch.cuda.is_available():
    torch.cuda.empty_cache()

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", DEVICE)

tokenizer = CLIPTokenizer("data/vocab.json",
                          merges_file="data/merges.txt")

print("Loading Stable Diffusion model...")
model_file = "data/v1-5-pruned-emaonly.ckpt"

models = model_loader.preload_models_from_standard_weights(
    model_file,
    device=DEVICE
)

# Optional FP16
if DEVICE == "cuda":
    for k, v in models.items():
        try: models[k] = v.half()
        except: pass

print("Model loaded ✔")

# -------------------------------
# 2. Generation Function
# -------------------------------

def generate_image(prompt, steps=30, cfg=6):
    ctx = torch.autocast("cuda") if DEVICE == "cuda" else torch.autocast("cpu")

    with ctx:
        img_arr = pipeline.generate(
            prompt=prompt,
            uncond_prompt="",
            input_image=None,
            strength=0.8,
            do_cfg=True,
            cfg_scale=cfg,
            sampler_name="ddpm",
            n_inference_steps=steps,
            seed=42,
            models=models,
            device=DEVICE,
            idle_device="cpu",
            tokenizer=tokenizer,
        )

    return Image.fromarray(img_arr)

# -------------------------------
# 3. Flask App
# -------------------------------

app = Flask(__name__)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    if "prompt" not in data:
        return jsonify({"error": "Prompt missing"}), 400

    prompt = data["prompt"]
    steps = data.get("steps", 30)
    cfg = data.get("cfg", 6)

    # Generate image
    img = generate_image(prompt, steps=steps, cfg=cfg)

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    return jsonify({
        "prompt": prompt,
        "image_base64": img_b64
    })


# -------------------------------
# 4. Run Server
# -------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
