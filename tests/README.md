# Tests

`validate-project.ps1` checks the static project without needing a test framework.

It verifies local HTML references, storefront CSS imports, JavaScript syntax, and the shared cart storage key. The ignored local `js/shared/auth-config.local.js` override file is optional; the deployed site uses the tracked `js/shared/auth-config.js` instead.

It does not test Supabase sessions or backend rules; those need to be checked with a configured Supabase project.

Run it from the repository root:

```powershell
./tests/validate-project.ps1
```
