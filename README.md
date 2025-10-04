# Grumpy Image UI

**A desktop image resizing and conversion tool built with Electron**

Grumpy Image UI was created for learning purposes. It is a modern, user-friendly desktop application that allows you to batch resize images and convert them to different formats. Perfect for web developers, designers, and anyone who needs to quickly process multiple image sizes from a single source.

![App Preview](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Version](https://img.shields.io/badge/Version-1.0.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

![Grumpy Image Application](/resources/grumpy-image-ui-460x346.png)

## Features

### **Smart Image Processing**
- **Drag & Drop Interface**: Simply drag images into the app
- **Multiple Format Support**: JPEG, PNG, WebP, AVIF, TIFF, GIF
- **Batch Resize**: Create multiple sizes from one image
- **Quality Control**: Adjustable compression settings
- **Preview System**: Real-time preview of your resized images

### **Interactive UI**
- **Resizable Preview**: Drag corners to visualize different dimensions  
- **Material Design**: Clean, modern interface with Material Web Components
- **Animated Feedback**: Smooth transitions and particle effects
- **Responsive Layout**: Adapts to different window sizes
- **Snackbar Notifications**: Clear success/error messaging

### **Performance & Reliability**
- **Worker Thread Processing**: Non-blocking image operations
- **Sharp Library**: High-performance image processing via libvips
- **Memory Efficient**: Handles large images without freezing the UI
- **Error Handling**: Graceful failure recovery with detailed feedback
- **Auto-Optimization**: Smart format detection and quality optimization

### **Output Management**
- **ZIP Archive**: All resized images packaged in one download
- **Filename Conventions**: Automatic size suffixes (e.g., `image-800x600.jpg`)
- **Format Conversion**: Convert between any supported formats
- **Batch Export**: Process multiple dimensions simultaneously

## Technical Stack

- **Framework**: Electron 38.x + TypeScript
- **UI Library**: Lit Elements + Material Web Components
- **gsap**: Image Drag + Particle Effects
- **Styling**: TailwindCSS 4.x with JIT compilation
- **Image Processing**: Sharp (libvips) + Worker Threads
- **Build System**: Vite + electron-vite + Electron Forge
- **State Management**: Custom reactive stores
- **Archive Creation**: JSZip for batch downloads

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/triple-t-h/grumpy-image-ui.git
cd grumpy-image-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for current platform
npm run build

# Platform-specific builds
npm run build:win    # Windows (Squirrel installer + ZIP)
npm run build:mac    # macOS (DMG)
npm run build:linux  # Linux (AppImage)
```

### Build Outputs
- **Windows**: `out/make/squirrel.windows/x64/GrumpyImageSetup.exe`
- **ZIP**: `out/make/zip/win32/x64/grumpy-image-win32-x64-1.0.1.zip`

## How to Use

### 1. **Load an Image**
- Drag and drop any supported image file into the app
- Or use the file picker to browse and select an image
- Preview appears instantly with image metadata

### 2. **Set Dimensions**
- Add target dimensions (width × height)
- Choose output format for each size
- Adjust quality settings (1-100)
- Preview shows visual representation

### 3. **Process & Download**
- Click "Generate Images" to start processing
- Worker processes images in the background
- Download ZIP file containing all resized versions
- Filenames include dimensions automatically

### Example Workflow
```
Original: hero-image.jpg (1920×1080)
↓
Add dimensions and change the image format by editing file extension:
- 800×450 (PNG, 90% quality) → hero-image-800x450.png
- 400×225 (WebP, 80% quality) → hero-image-400x225.webp
- 200×113 (JPEG, 75% quality) → hero-image-200x113.jpg
↓
Output: hero-image-resized.zip
```

## Development

### Project Structure
```
src/
├── main/                 # Electron main process
├── preload/             # Bridge between main/renderer
├── renderer/            # UI application
│   ├── ui/
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Main application pages
│   └── stores/          # State management for dragging with gsap
├── core/                # Shared business logic
│   ├── api/            # IPC handlers & workers
│   ├── image-processing/ # Sharp integration
│   ├── stores/         # Data stores
│   └── types/          # TypeScript definitions
└── db/                 # Database (IndexedDB via Dexie for development)
```

### Available Scripts

```bash
npm run dev              # Start development with hot reload
npm run build            # Build all processes for production
npm run typecheck        # Run TypeScript type checking
npm run lint             # ESLint code analysis  
npm run format           # Prettier code formatting
npm run test             # Run test suite
npm run test:watch       # Watch mode testing
```

### Key Technologies

**Frontend**
- **Lit**: Lightweight web components with reactive updates
- **Material Web**: Google's Material Design 3 components
- **TailwindCSS**: Utility-first CSS with custom animations
- **GSAP**: High-performance animations and effects

**Backend**
- **Sharp**: Fast image processing with libvips
- **Worker Threads**: Non-blocking image operations
- **Electron**: Cross-platform desktop framework
- **Dexie**: IndexedDB wrapper for local storage

## 🧪 Testing & Quality

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode during development  
npm run test:watch

# Type checking
npm run typecheck
```

### Test Coverage
- Unit tests for image processing functions
- Integration tests for worker communication
- UI component testing with Lit test utilities
- E2E testing for complete workflows

## Troubleshooting

### Common Issues

**Sharp/Native Module Errors**
```bash
# Rebuild native dependencies
npm run postinstall
# or manually:
npx electron-rebuild -f -w sharp
```

**Permission Errors on Windows**
- Run as Administrator if needed
- Check antivirus software blocking

**Large Image Memory Issues**
- Images are processed in worker threads
- Memory is automatically managed
- Very large images (>50MB) may take longer

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Production debugging
ENABLE_LOGGING=1 ./grumpy-image.exe --v=1
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow ESLint configuration
- Add tests for new features
- Update documentation as needed
- Ensure cross-platform compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Daniel Schidlowski**
- GitHub: [@triple-t-h](https://github.com/triple-t-h)
- Website: [https://github.com/triple-t-h](https://github.com/triple-t-h)

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Desktop app framework
- [GreenSock Animation Platform (GSAP)](https://gsap.com/) - A wildly robust JavaScript animation library
- [Lit](https://lit.dev/) - Efficient web components
- [Material Design](https://material.io/) - Google's design system
- [Sharp](https://sharp.pixelplumbing.com/) - Amazing image processing library
- [Sukho by Adobe Stock Logo/Icon](https://stock.adobe.com/de/images/black-silhouettes-of-a-cat/585113419) - black silhouettes of a cat
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ and lots of ☕**
