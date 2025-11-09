# Gimme Gold 🌟

**Hormonal Cycle Intelligence for Better Decision Making**

Gimme Gold is a modern web application that helps women understand and optimize their lives based on their hormonal cycle phases. Built on Dr. Mindy Pelz's research, the app provides personalized insights for work, exercise, social activities, and intimacy, while also offering a partner view to help loved ones and colleagues understand and support better.

## Features

### For Women (Primary User)
- **Cycle Tracking**: Input your last period start date to track your current cycle phase
- **Phase Visualization**: Beautiful visual representation of your cycle with current phase highlighted
- **Personalized Recommendations**: Get tailored advice for:
  - 💼 Work & Career (best times for presentations, negotiations, etc.)
  - 🏋️ Exercise & Fitness (optimal workout intensities)
  - 👥 Social Activities (ideal times for socializing)
  - 💕 Intimacy & Connection (understanding libido patterns)
- **Educational Content**: Learn about each phase and how hormones affect your body and mind
- **Hormonal Insights**: Understand your current estrogen, progesterone, and testosterone levels

### For Partners/Colleagues (Secondary User)
- **Partner View**: Switch to a view designed for partners, bosses, teammates, and friends
- **Communication Guide**: Learn how to approach and communicate during different phases
- **Activity Suggestions**: Understand what activities align with current energy levels
- **Hormone Education**: Simplified explanations of hormonal states and their effects

## The Four Phases (Based on Dr. Mindy Pelz's Framework)

1. **Power Phase 1 (Days 1-10)**: Estrogen Rising
   - Building energy and cognitive function
   - Great for planning and starting new projects

2. **Manifestation Phase (Days 11-15)**: Peak Performance
   - Estrogen peaks, testosterone surges
   - **BEST TIME** for presentations, negotiations, important meetings
   - Peak libido and confidence

3. **Power Phase 2 (Days 16-19)**: Focused Energy
   - Estrogen drops, progesterone rises
   - Excellent for deep work and completing projects

4. **Nurture Phase (Days 20-28)**: Rest & Rejuvenation
   - Progesterone dominates
   - Time for self-care, rest, and preparation for next cycle

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **date-fns** - Date manipulation utilities
- **CSS3** - Modern styling with CSS variables

## How It Works

1. Enter your last period start date
2. Optionally adjust your cycle length (default: 28 days)
3. The app calculates your current phase based on Dr. Pelz's framework
4. Get personalized recommendations for activities
5. Switch to Partner View to share insights with others

## Privacy

All data is stored locally in your browser using localStorage. No data is sent to any servers.

## Inspiration

This app is inspired by Dr. Mindy Pelz's research on hormonal cycles and their impact on women's performance, decision-making, and well-being. The goal is to help women work with their natural cycles rather than against them.

## License

This project is open source and available for personal and educational use.

---

**Remember**: This app is a tool to help you understand your cycle better. Always consult with healthcare professionals for medical advice.

