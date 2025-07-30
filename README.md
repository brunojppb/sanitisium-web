# Sanitisium PDF Validator

A NextJS application designed to validate the PDF file regeneration functionality of the [Sanitisium](https://github.com/brunojppb/sanitisium) project. This app provides a web interface for uploading PDFs, sending them to Sanitisium for sanitization, and downloading the regenerated files.

## Architecture Overview

This application uses a modern server-to-server architecture with real-time WebSocket updates:

```
Frontend (React/NextJS) ←→ NextJS API Routes ←→ Sanitisium Service (localhost:8000)
        ↑                                              ↓
        └──────── WebSocket Server ←── Callback APIs ──┘
```

### Key Components

- **Frontend**: Clean UI with upload area and download sections
- **API Routes**: Server-side file handling and Sanitisium communication
- **WebSocket Server**: Real-time status updates (port 3001)
- **Callback System**: Handles success/failure responses from Sanitisium

## Features

### 🔄 **Real-time File Processing**
- Upload PDFs through a clean web interface
- Real-time status updates via WebSocket
- Visual indicators for processing states (blue icons) and completed files (green icons)

### 🔒 **Secure Server-to-Server Communication**
- Files are uploaded to NextJS API routes, not directly to Sanitisium
- Server-side validation and forwarding to `localhost:8000/sanitise/pdf`
- Proper error handling and status management

### 📱 **Modern UI/UX**
- Built with Shadcn UI components and Tailwind CSS
- Responsive design matching the provided mockup
- Automatic file status updates without page refresh

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Sanitisium service](https://github.com/brunojppb/sanitisium) running on `localhost:8000`

### Installation

1. Clone and navigate to the project:
```bash
git clone <repository-url>
cd sanitisium-validator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The WebSocket server will automatically start on port 3001 when you access the application.

## How It Works

### 1. **File Upload Flow**
```
User uploads PDF → NextJS /api/upload → Sanitisium localhost:8000/sanitise/pdf
```

### 2. **Processing & Callbacks**
```
Sanitisium processes file → Calls back to NextJS → WebSocket broadcasts update → Frontend updates
```

### 3. **Download Flow**
```
User clicks download → NextJS /api/download → Serves processed PDF file
```

## API Endpoints

### File Operations
- `POST /api/upload` - Upload PDF files for processing
- `GET /api/download?file=<filename>` - Download processed files
- `GET /api/status?id=<uuid>` - Check file processing status

### Sanitisium Callbacks
- `POST /api/callback/success?id=<uuid>` - Receives successfully processed PDFs
- `POST /api/callback/failure?id=<uuid>` - Handles processing failures

### WebSocket
- `GET /api/websocket` - Initialize WebSocket server
- WebSocket server runs on `ws://localhost:3001`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main UI component
│   └── api/
│       ├── upload/                 # File upload handler
│       ├── download/               # File download handler
│       ├── callback/
│       │   ├── success/            # Success callback from Sanitisium
│       │   └── failure/            # Failure callback from Sanitisium
│       ├── status/                 # File status checker
│       └── websocket/              # WebSocket initialization
├── lib/
│   ├── utils.ts                    # Utility functions
│   └── websocket.ts                # WebSocket server setup
└── components/ui/                  # Shadcn UI components
```

## Configuration

### Callback URLs
The application expects Sanitisium to callback to:
- Success: `http://localhost:3000/api/callback/success?id=<uuid>`
- Failure: `http://localhost:3000/api/callback/failure?id=<uuid>`

### File Storage
Processed PDFs are saved to the `uploads/` directory in the project root.

## Development

### Build the project:
```bash
npm run build
```

### Linting:
```bash
npm run lint
```

## Dependencies

### Core
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### UI Components
- **Shadcn UI** - Pre-built components
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### Real-time Communication
- **ws** - WebSocket server implementation

### Utilities
- **uuid** - Unique file identifiers
- **clsx & tailwind-merge** - CSS class utilities

## Testing with Sanitisium

1. Ensure Sanitisium is running on `localhost:8000`. Run with docker with:
```shell
docker run -p 8000:8000 --add-host=host.docker.internal:host-gateway brunojppb/sanitisium
```

2. Start this application with `npm run dev`
3. Upload a PDF file through the web interface
4. Monitor the real-time status updates
5. Download the sanitized PDF when processing completes

## Troubleshooting

### WebSocket Connection Issues
- Ensure port 3001 is available
- Check browser console for WebSocket errors
- Verify the WebSocket server initializes (check server logs)

### File Upload Failures
- Confirm Sanitisium is running on `localhost:8000`
- Check server logs for API call failures
- Verify PDF file format and size limits

### Callback Issues
- Ensure callback URLs are accessible from Sanitisium
- Check if `localhost:3000` is reachable from your Sanitisium setup
- Monitor callback endpoint logs in the NextJS console
