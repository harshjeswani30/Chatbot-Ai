# Nhost Authentication Configuration

## 🔑 Environment Variables Needed

Create a `.env` file in your project root with these values:

```bash
# Nhost Configuration (already configured)
VITE_NHOST_SUBDOMAIN=your_nhost_subdomain
VITE_NHOST_REGION=your_nhost_region
```

## 📝 How to Use

1. **Copy this format** to a new `.env` file
2. **Replace placeholder values** with your actual Nhost credentials
3. **Never commit** the `.env` file to version control
4. **Add `.env`** to your `.gitignore` file

## 🚨 Security Warning

- **Keep your Nhost credentials private**
- **Use different credentials** for development and production
- **Rotate secrets** if they ever get exposed
- **Monitor authentication** for suspicious activity
