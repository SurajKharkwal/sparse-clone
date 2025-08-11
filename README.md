# Spase Clone
A simple project to clone the core functionality of Spase.

### Installation 
```bash
npm install @flyinghawk/spase-clone
```

### Usage

```ts
    await sparceClone(
      "https://github.com/user/repo.git",   // GitHub repo URL
      "path/to/subfolder",                  // Subdirectory to sparse clone
      "test",                               // Local folder to clone into
      true,                                 // Delete the .git folder after clone (default: true)
      true                                  // Move subfolder content to root of target (default: true)
    );

```
