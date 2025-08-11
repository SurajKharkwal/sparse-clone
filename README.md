# Sparse Clone
A cross-platform sparseClone utility that replicates the functionality of `git sparse-checkout`.

### Installation 
```bash
npm install @flyinghawk/sparse-clone
```

### Usage

```ts
    await sparseClone(
      "https://github.com/user/repo.git",   // GitHub repo URL
      "path/to/subfolder",                  // Subdirectory to sparse clone
      "test",                               // Local folder to clone into
      true,                                 // Delete the .git folder after clone (default: true)
      true                                  // Move subfolder content to root of target (default: true)
    );

```
