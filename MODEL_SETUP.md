# AgriNivara plant disease model setup

The uploaded project contained a Git LFS pointer instead of the actual `plant_disease_model.keras` artifact. Railway cannot use that pointer as a Keras model.

The new backend downloads the real model during startup. Before deploying, upload your original 134,136,123-byte `.keras` file to a file host that provides a direct HTTPS download URL (for example a Hugging Face model repository or another object/file store), then set:

`PLANT_DISEASE_MODEL_URL=<direct-download-url>`

Optional but recommended:

`PLANT_DISEASE_MODEL_SHA256=<sha256-of-the-file>`

The URL must return the actual binary `.keras` file, not an HTML page and not a Git LFS pointer.

After deployment, open `/health`. A working deployment should show:

- `plant_disease_model_status: loaded`
- `plant_disease_model_loaded: true`
- `plant_disease_model.model_file_size_bytes` greater than 100000000

The disease endpoint waits for the initial download/load rather than immediately returning the old first-request 503. If the model URL is missing or invalid, the health response now exposes the exact configuration problem.
