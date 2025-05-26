# Learn Test Repeat
<img src="/public/full_logo.svg" alt="Learn Test Repeat Logo" width="200">


A modern web application that aggregates and enriches AI/tech articles, helping users discover and learn from the latest developments in technology.

## Features

- AI-powered article enrichment and analysis
- Personalized article recommendations
- Article filtering by date, difficulty, and category
- User library for saving interesting articles
- RSS feed aggregation from top tech sources
- Dark mode support

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (Auth, Storage, and Edge Functions)
- **AI Integration**: Mistral AI
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   MISTRAL_API_KEY=your-mistral-api-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
├── types/           # TypeScript type definitions
└── styles/          # Global styles and Tailwind config
```

## Features in Detail

### Article Aggregation
- Automated RSS feed monitoring
- Real-time article updates
- Source categorization and filtering

### AI Enrichment
- Article summarization
- Technology identification
- Difficulty assessment
- Practical application suggestions
- Learning resource recommendations

### User Experience
- Personalized article recommendations
- Custom article library
- Advanced filtering options
- Dark mode support
- Responsive design

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI enrichment powered by [Mistral AI](https://mistral.ai/)
- Authentication and database by [Supabase](https://supabase.com/)
- Deployment by [Vercel](https://vercel.com/)
