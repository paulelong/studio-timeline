# Studio Timeline

A Next.js + Sanity CMS project for managing and displaying a timeline of studio entries with media, documents, and room information.

## Prerequisites

- Node.js 18+ and npm
- A Sanity account and project

## Setup

### 1. Install Dependencies

```bash
npm install
```

Required packages (add to package.json if not present):
- `@sanity/client`
- `react-pdf`
- `pdfjs-dist`

```bash
npm install @sanity/client react-pdf pdfjs-dist
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

To get your Sanity project ID:
1. Visit https://www.sanity.io/manage
2. Select or create a project
3. Copy the Project ID from the project settings

### 3. Configure Sanity Studio

If you haven't already set up Sanity Studio, initialize it:

```bash
npm install -g @sanity/cli
sanity init
```

Make sure your `sanity.config.ts` imports the schemas from `studio/schemas/index.ts`.

## Running the Project

### Start Next.js Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Start Sanity Studio

In a separate terminal:

```bash
cd studio
sanity start
```

Or if using the integrated studio at `/studio` route in Next.js, it should already be available at http://localhost:3000/studio

## Project Structure

```
studio-timeline/
├── components/
│   ├── TimelineCard.tsx      # Individual timeline entry card
│   ├── Timeline.tsx           # Timeline list with data fetching
│   └── PdfViewer.tsx          # PDF document viewer
├── lib/
│   ├── sanityClient.ts        # Sanity client configuration
│   └── queries.ts             # GROQ queries
├── pages/
│   └── index.tsx              # Main page with two-column layout
├── studio/
│   └── schemas/
│       ├── entry.ts           # Timeline entry schema
│       ├── doc.ts             # Document schema
│       ├── room.ts            # Room schema
│       └── index.ts           # Schema export
└── .env.local                 # Environment variables (create this)
```

## Features

- **Two-Column Layout**: Timeline on the left (60%), detail viewer on the right (40%)
- **Timeline Entries**: Display entries with date, title, excerpt, and media thumbnails
- **Media Gallery**: Support for images and files with captions
- **Related Documents**: Link to PDF documents (plans, contracts, estimates)
- **Room References**: Associate entries with specific rooms
- **Tags**: Organize entries with tags
- **PDF Viewer**: Built-in PDF viewing with zoom and pagination controls

## Usage

1. Open Sanity Studio and create some content:
   - Add rooms with short codes and plans
   - Add documents (PDFs)
   - Create timeline entries with media and references

2. View the timeline at http://localhost:3000
3. Click on any entry to see detailed information in the right panel

## Notes

- TypeScript types use `any` for simplicity in this scaffolding
- Tailwind CSS is used for all styling
- The app uses React App Router (pages directory)
- Data fetching uses React hooks (useEffect + useState)
