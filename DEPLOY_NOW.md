# AgriNivara - deploy now

## Railway

1. Create a new Railway service from this project.
2. Railway will use the included `Dockerfile` automatically.
3. Add these environment variables:

```text
AGRINIVARA_AUTH_SECRET=<long-random-secret>
(no model URL required)=<direct-https-url-to-the-real-plant_disease_model.keras>
```

Optional:

```text
PLANT_DISEASE_MODEL_SHA256=<sha256>
```

Do not set `VITE_API_URL` for the included single-service deployment.

## Important model step

The source ZIP supplied for this update contained only a 134-byte Git LFS pointer at the disease-model path. It did not contain the 134 MB model artifact. Therefore the new backend downloads the real model at startup.

The URL must return the actual `.keras` binary. A GitHub/Git LFS pointer, an HTML page, or a normal repository page is not sufficient.

After deployment, open:

```text
https://YOUR-RAILWAY-DOMAIN/health
```

Wait until the response reports:

```text
"plant_disease_model_status": "loaded"
"plant_disease_model_loaded": true
```

The first startup can take several minutes because TensorFlow and the model are loaded on the server.

## If you have the original model file

If you upload the original `plant_disease_model.keras` file with the project instead, the backend will use it locally and will not download it. The file should be the real ~134 MB Keras archive, not a Git LFS pointer.
