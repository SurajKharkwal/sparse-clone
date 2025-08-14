# Sparse Clone
A cross-platform sparseClone utility that replicates the functionality of `git sparse-checkout`.

### Installation 
```bash
npm install @flyinghawk/sparse-clone
```

### Usage

```ts
import { sparseClone } from "@flyinghawk/sparse-clone";

await sparseClone(
  "https://github.com/user/repo.git",  // GitHub repo URL
  "path/to/subfolder",                  // Subdirectory to sparse clone
  "test",                              // Local folder to clone into
  {
    silent: true                       // Show output on the screen (default: true)
    delGit: true,                      // Delete the .git folder after clone (default: true)
    mvToRoot: true,                    // Move subfolder content to root of target (default: true)
    overrideDir: false                 // Override target directory if exists (default: false)
  }
);

```
