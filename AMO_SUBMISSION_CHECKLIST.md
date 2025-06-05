# AMO Submission Checklist for Widgetopia

This checklist ensures you have everything needed for a successful Mozilla Add-on (AMO) submission with source code.

## ✅ Pre-Submission Checklist

### Required Files for AMO Source Code Submission
- ✅ **widgetopia-source.zip** - Complete source code package
- ✅ **AMO_BUILD_README.md** - Detailed build instructions for reviewers
- ✅ **package-lock.json** - Exact dependency versions
- ✅ **All source code** (src/ and public/ directories)
- ✅ **Build scripts** (build-extension.js, verify-build.js)

### AMO Compliance Check
- ✅ **No obfuscated code** - Only standard minification used
- ✅ **Open source build tools** - Vite, Terser, npm (all open source)
- ✅ **Local build capability** - No web-based tools required
- ✅ **Complete build instructions** - Step-by-step guide provided
- ✅ **Environment compatibility** - Works with AMO's default Ubuntu environment

## 🔧 Build Process Summary

### What AMO Reviewers Need to Run:
```bash
# 1. Install dependencies (uses package-lock.json for exact versions)
npm install

# 2. Build the complete extension
npm run build:extension

# 3. Verify the build (optional but recommended)
npm run verify-build
```

### Build Tools Used:
- **Vite 6.2.6** - Module bundler and build tool
- **Terser 5.39.2** - JavaScript minifier (NOT obfuscator)
- **TypeScript 5.8.3** - TypeScript compiler
- **Node.js 18+** - Runtime environment

## 📋 AMO Submission Form Information

### Source Code Section:
- **Upload**: `widgetopia-source.zip` (created by `npm run prepare-amo`)
- **Build Command**: `npm run build:extension`
- **Environment**: Node.js 18+ and npm 9+ (compatible with AMO default)
- **Instructions**: Refer to `AMO_BUILD_README.md` in the source package

### Key Points to Mention:
1. **Standard minification only** - No obfuscation used
2. **Reproducible builds** - Uses package-lock.json for exact dependencies
3. **Open source tools** - All build tools are open source and locally runnable
4. **Security-focused** - Terser configured to avoid unsafe optimizations

## 🛠️ Commands for Extension Developer

### Prepare Source Code Package:
```bash
npm run prepare-amo
```
This creates `widgetopia-source.zip` with all necessary files for AMO review.

### Verify Your Build:
```bash
npm run verify-build
```
This checks that your build is complete and ready for submission.

### Build for Distribution:
```bash
npm run build:extension
```
This creates the complete extension package.

## 📊 Package Information

### Source Package Contents:
- **Size**: ~44 MB (includes all source code and assets)
- **Files**: All TypeScript/JavaScript source files
- **Assets**: Wallpapers, icons, and static resources
- **Build Config**: Vite, TypeScript, and build scripts
- **Documentation**: Complete build instructions

### Built Extension:
- **Size**: ~44 MB (minified and bundled)
- **Format**: Standard Chrome/Firefox extension structure
- **Compatibility**: Chrome & Firefox (Manifest V3)

## 🔍 Review Process Notes

### For AMO Reviewers:
1. The extension uses **standard minification** (not obfuscation)
2. All build tools are **open source** and **locally runnable**
3. The build process is **deterministic** and **reproducible**
4. **Complete source code** is provided with detailed instructions
5. Uses **locked dependencies** via package-lock.json

### Security Considerations:
- No unsafe JavaScript optimizations used
- No remote code execution or web-based build tools
- Standard npm packages from public registry
- Transparent build process with clear instructions

## 📞 Support Information

If AMO reviewers encounter any issues:
- **Primary Contact**: GitHub Issues at https://github.com/mshojaei77/widgetopia/issues
- **Build Documentation**: AMO_BUILD_README.md (included in source package)
- **Verification Script**: Run `npm run verify-build` for troubleshooting

## 🚀 Final Submission Steps

1. **Upload Extension**: Upload `widgetopia.zip` as the extension package
2. **Upload Source**: Upload `widgetopia-source.zip` as source code
3. **Build Command**: Specify `npm run build:extension`
4. **Environment**: Mention Node.js 18+ and npm 9+ requirements
5. **Instructions**: Reference `AMO_BUILD_README.md` in submission notes

---

**Ready for AMO Submission!** ✨

This extension meets all AMO requirements for source code submission and should pass review without issues. 